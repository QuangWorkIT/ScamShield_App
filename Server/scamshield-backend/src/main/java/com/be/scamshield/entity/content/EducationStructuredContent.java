package com.be.scamshield.entity.content;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** A JSON value stored in one education_articles column, not a separate entity/table. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "SCENARIO dùng example, recognitionSigns, scammerGoal, recommendedActions; POCKET_CARD dùng tips. Nội dung là văn bản thuần.")
public class EducationStructuredContent {
    private Example example;
    private List<String> recognitionSigns;
    private String scammerGoal;
    private List<String> recommendedActions;
    private List<String> tips;

    public enum ChannelType { SMS, VIDEO, CHAT, CALL }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Example {
        private ChannelType channelType;
        private String senderName;
        @Schema(description = "Giờ hoặc thời lượng minh họa, không phải thời gian gửi OTP", example = "14:32")
        private String displayTime;
        private String message;
        @Schema(description = "Đoạn văn bản FE có thể nhấn mạnh trong message; không chứa HTML")
        private String highlightedText;
    }
}
