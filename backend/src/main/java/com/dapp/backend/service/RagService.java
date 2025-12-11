package com.dapp.backend.service;

import com.dapp.backend.dto.ConsultationRequest;
import com.dapp.backend.model.Vaccine;
import com.dapp.backend.repository.VaccineRepository;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final VectorStore vectorStore;
    private final ChatModel chatModel;
    private final VaccineRepository vaccineRepository;

    public RagService(VectorStore vectorStore, ChatModel chatModel, VaccineRepository vaccineRepository) {
        this.vectorStore = vectorStore;
        this.chatModel = chatModel;
        this.vaccineRepository = vaccineRepository;
    }

    public void addDocuments(List<String> contents) {
        List<Document> documents = contents.stream()
                .map(content -> new Document(content, Map.of()))
                .collect(Collectors.toList());

        TokenTextSplitter splitter = new TokenTextSplitter();
        List<Document> splitDocuments = splitter.apply(documents);

        vectorStore.add(splitDocuments);
    }

    public int syncVaccinesFromDatabase() {
        List<Vaccine> vaccines = vaccineRepository.findAll();
        List<String> documents = new ArrayList<>();

        for (Vaccine v : vaccines) {
            String content = String.format("""
                    THÔNG TIN VACCINE:
                    - Tên: %s
                    - Nước sản xuất: %s
                    - Nhà sản xuất: %s
                    - Giá tham khảo: %d VNĐ
                    - Mô tả: %s
                    - Đối tượng tiêm/Lịch tiêm: %s
                    - Chống chỉ định: %s
                    - Bảo quản: %s
                    - Số mũi cần tiêm: %d
                    - Khoảng cách mũi tiếp theo: %d ngày
                    - Slug: %s
                    - Link chi tiết: https://safevax.mhieu100.space/vaccine/%s
                    """,
                    v.getName(),
                    v.getCountry(),
                    v.getManufacturer(),
                    v.getPrice(),
                    v.getDescription(),
                    v.getInjection(),
                    v.getContraindications(),
                    v.getPreserve(),
                    v.getDosesRequired(),
                    v.getDaysForNextDose() != null ? v.getDaysForNextDose() : 0,
                    v.getSlug(),
                    v.getSlug());
            documents.add(content);
        }

        if (!documents.isEmpty()) {
            addDocuments(documents);
        }
        return documents.size();
    }

    public List<Document> similaritySearch(String query) {

        return vectorStore.similaritySearch(SearchRequest.query(query).withTopK(5));
    }

    public String chat(String query) {
        return consult(new ConsultationRequest() {
            {
                setQuery(query);
            }
        });
    }

    public String summarize(String content) {
        String systemPromptText = """
                Bạn là một trợ lý AI thông minh chuyên tóm tắt tin tức y tế.
                Nhiệm vụ của bạn là đọc nội dung bài viết được cung cấp và tạo ra một bản tóm tắt ngắn gọn, súc tích, dễ hiểu.

                YÊU CẦU:
                1. Tóm tắt nội dung chính của bài viết.
                2. Làm nổi bật các ý quan trọng nhất.
                3. Sử dụng ngôn ngữ tiếng Việt tự nhiên.
                4. Độ dài khoảng 3-5 câu.
                5. Định dạng (Dùng Markdown):
                   ### 📰 Tóm tắt nội dung:
                   [Nội dung tóm tắt ngắn gọn]

                   ✨ **Điểm nổi bật:**
                   - [Điểm 1]
                   - [Điểm 2]
                   - [Điểm 3] (nếu có)

                Đây là nội dung bài viết cần tóm tắt:
                """;

        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemPromptText);
        var systemMessage = systemPromptTemplate.createMessage();
        var userMessage = new UserMessage(content);
        var prompt = new Prompt(List.of(systemMessage, userMessage));

        // Retry logic
        int maxRetries = 3;
        int attempt = 0;
        Exception lastException = null;

        while (attempt < maxRetries) {
            try {
                var response = chatModel.call(prompt);
                if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                    return response.getResult().getOutput().getContent();
                }
                return "Xin lỗi, tôi không thể tạo bản tóm tắt. Vui lòng thử lại.";
            } catch (Exception e) {
                lastException = e;
                boolean isTransient = e.getMessage().contains("503") ||
                        e.getMessage().contains("overloaded") ||
                        e.getClass().getSimpleName().contains("TransientAiException");

                if (isTransient && attempt < maxRetries - 1) {
                    attempt++;
                    try {
                        Thread.sleep(2000 * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    continue;
                }
                break; // details of exception handling are simplified here compared to consult
            }
        }
        return "Xin lỗi, đã xảy ra lỗi trong quá trình xử lý tóm tắt.";
    }

    // Existing consult method...
    public String consult(ConsultationRequest request) {
        try {
            String query = request.getQuery();
            String age = request.getAge() != null ? request.getAge() : "Không rõ";
            String history = request.getVaccinationHistory() != null
                    ? String.join(", ", request.getVaccinationHistory())
                    : "Chưa có thông tin";
            String condition = request.getHealthCondition() != null ? request.getHealthCondition() : "Bình thường";

            String searchContext = query + " lịch tiêm chủng " + age;
            List<Document> similarDocuments = vectorStore
                    .similaritySearch(SearchRequest.query(searchContext).withTopK(6));

            String information = similarDocuments.stream()
                    .map(Document::getContent)
                    .collect(Collectors.joining("\n\n"));

            String systemPromptText = """
                    Bạn là Bác sĩ AI chuyên gia về tiêm chủng của hệ thống VaxSafe.

                    HỒ SƠ CHỦ TÀI KHOẢN (Người đang chat):
                    - Tuổi: {age}
                    - Lịch sử tiêm chủng: {history}
                    - Tình trạng sức khỏe: {condition}

                    KIẾN THỨC Y KHOA (Từ cơ sở dữ liệu):
                    {information}

                    CHỈ DẪN QUAN TRỌNG:
                    1. XÁC ĐỊNH ĐỐI TƯỢNG CẦN TƯ VẤN:
                       - Nếu người dùng hỏi cho chính họ (hoặc không nói rõ): Sử dụng "HỒ SƠ CHỦ TÀI KHOẢN" để tư vấn.
                       - Nếu người dùng hỏi cho người khác (ví dụ: "con tôi", "bé nhà tôi", "bố mẹ", "người thân"):
                         -> HÃY BỎ QUA "HỒ SƠ CHỦ TÀI KHOẢN".
                         -> Nếu trong câu hỏi chưa có tuổi hoặc thông tin sức khỏe của người đó, HÃY HỎI LẠI người dùng để có thông tin chính xác trước khi tư vấn.

                    2. QUY TRÌNH TƯ VẤN:
                       - Phân tích tuổi và lịch sử tiêm (của đúng đối tượng) để xác định các mũi còn thiếu theo lịch chuẩn.
                       - Kiểm tra các chống chỉ định.
                       - Nếu thông tin trong Kiến thức y khoa không đủ, hãy nói rõ và khuyên đi khám bác sĩ.

                    3. PHONG CÁCH:
                       - Chuyên nghiệp, ân cần, dễ hiểu.
                       - Trả lời ngắn gọn, định dạng đẹp (dùng gạch đầu dòng).
                       - Khi đề cập đến một loại vắc xin cụ thể, HÃY LUÔN cung cấp Link chi tiết (có sẵn trong dữ liệu) để người dùng có thể bấm vào xem thông tin và đặt lịch. Ví dụ: [Tên Vắc xin](Link chi tiết).

                    Hãy trả lời câu hỏi sau của người dùng:
                    """;

            SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemPromptText);
            var systemMessage = systemPromptTemplate.createMessage(Map.of(
                    "age", age,
                    "history", history,
                    "condition", condition,
                    "information", information));

            var userMessage = new UserMessage(query);
            var prompt = new Prompt(List.of(systemMessage, userMessage));

            // Retry logic
            int maxRetries = 3;
            int attempt = 0;
            Exception lastException = null;

            while (attempt < maxRetries) {
                try {
                    var response = chatModel.call(prompt);
                    if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                        return response.getResult().getOutput().getContent();
                    }
                    return "Xin lỗi, tôi không thể tạo câu trả lời. Vui lòng thử lại.";
                } catch (Exception e) {
                    lastException = e;
                    boolean isTransient = e.getMessage().contains("503") ||
                            e.getMessage().contains("overloaded") ||
                            e.getClass().getSimpleName().contains("TransientAiException");

                    if (isTransient && attempt < maxRetries - 1) {
                        attempt++;
                        try {
                            Thread.sleep(2000 * attempt); // Wait 2s, then 4s
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                        continue;
                    }
                    throw e;
                }
            }
            throw lastException;

        } catch (NullPointerException e) {
            return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Có thể do vấn đề tương thích API. Vui lòng thử lại.";
        } catch (Exception e) {
            if (e.getMessage().contains("503") || e.getMessage().contains("overloaded")) {
                return "Hệ thống AI đang quá tải do nhiều yêu cầu. Tôi đã thử lại " +
                        "nhưng vẫn chưa kết nối được. Vui lòng thử lại sau vài phút.";
            }
            return "Xin lỗi, đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau. (" + e.getMessage() + ")";
        }
    }
}
