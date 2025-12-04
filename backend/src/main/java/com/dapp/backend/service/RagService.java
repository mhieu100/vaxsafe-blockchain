package com.dapp.backend.service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final VectorStore vectorStore;
    private final ChatModel chatModel;

    @Autowired
    public RagService(VectorStore vectorStore, ChatModel chatModel) {
        this.vectorStore = vectorStore;
        this.chatModel = chatModel;
    }

    public void addDocuments(List<String> contents) {
        List<Document> documents = contents.stream()
                .map(content -> new Document(content, Map.of()))
                .collect(Collectors.toList());

        // Split documents into chunks to fit embedding model context and improve
        // retrieval
        TokenTextSplitter splitter = new TokenTextSplitter();
        List<Document> splitDocuments = splitter.apply(documents);

        vectorStore.add(splitDocuments);
    }

    public List<Document> similaritySearch(String query) {
        // Increase top-k to retrieve more relevant context
        return vectorStore.similaritySearch(SearchRequest.query(query).withTopK(5));
    }

    public String chat(String query) {
        try {
            // 1. Retrieve similar documents with higher top-k
            List<Document> similarDocuments = vectorStore.similaritySearch(SearchRequest.query(query).withTopK(5));

            String information = similarDocuments.stream()
                    .map(Document::getContent)
                    .collect(Collectors.joining("\n\n"));

            // 2. Construct System Prompt (Vietnamese)
            String systemPromptText = """
                    Bạn là trợ lý y tế ảo hữu ích của VaxSafe.
                    Sử dụng thông tin sau đây để trả lời câu hỏi của người dùng.
                    Nếu thông tin không đủ để trả lời, hãy nói rằng bạn không biết và khuyên người dùng nên tham khảo ý kiến bác sĩ.
                    Trả lời bằng tiếng Việt, ngắn gọn và chính xác.

                    Thông tin:
                    {information}
                    """;
            SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemPromptText);
            var systemMessage = systemPromptTemplate.createMessage(Map.of("information", information));

            // 3. Call Chat Model
            var userMessage = new UserMessage(query);
            var prompt = new Prompt(List.of(systemMessage, userMessage));

            var response = chatModel.call(prompt);
            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getContent();
            }
            return "Xin lỗi, tôi không thể tạo câu trả lời. Vui lòng thử lại.";
        } catch (NullPointerException e) {
            // Handle case where usage statistics are not available (e.g., Gemini API)
            return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Có thể do vấn đề tương thích API. Vui lòng thử lại.";
        } catch (Exception e) {
            return "Xin lỗi, đã xảy ra lỗi: " + e.getMessage();
        }
    }
}
