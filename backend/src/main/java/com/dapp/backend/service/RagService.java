package com.dapp.backend.service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
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
        vectorStore.add(documents);
    }

    public List<Document> similaritySearch(String query) {
        return vectorStore.similaritySearch(query);
    }

    public String chat(String query) {
        try {
            // 1. Retrieve similar documents
            List<Document> similarDocuments = vectorStore.similaritySearch(query);
            String information = similarDocuments.stream()
                    .map(Document::getContent)
                    .collect(Collectors.joining("\n\n"));

            // 2. Construct System Prompt
            String systemPromptText = """
                    You are a helpful medical assistant for VaxSafe.
                    Use the following information to answer the user's question.
                    If the information is not sufficient, say you don't know and advise them to consult a doctor.

                    Information:
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
            return "I'm sorry, I couldn't generate a response. Please try again.";
        } catch (NullPointerException e) {
            // Handle case where usage statistics are not available (e.g., Gemini API)
            return "I'm sorry, there was an issue processing your request. This might be due to API compatibility. Please try again.";
        } catch (Exception e) {
            return "I'm sorry, an error occurred: " + e.getMessage();
        }
    }
}
