package com.be.scamshield.config;

import com.be.scamshield.dto.request.RegisterPartnerRequest;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Configuration
@RequiredArgsConstructor
public class PartnerMultipartConfig implements WebMvcConfigurer {
    private final ObjectMapper objectMapper;

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        // Swagger and FormData may omit Content-Type on the JSON form field.
        converters.add(new AbstractHttpMessageConverter<RegisterPartnerRequest>(
                MediaType.TEXT_PLAIN, MediaType.APPLICATION_OCTET_STREAM) {
            @Override
            protected boolean supports(Class<?> type) {
                return type == RegisterPartnerRequest.class;
            }

            @Override
            public boolean canWrite(Class<?> type, MediaType mediaType) {
                return false;
            }

            @Override
            protected RegisterPartnerRequest readInternal(Class<? extends RegisterPartnerRequest> type,
                    HttpInputMessage input) throws IOException {
                try {
                    return objectMapper.readValue(input.getBody(), RegisterPartnerRequest.class);
                } catch (JacksonException ex) {
                    throw new HttpMessageNotReadableException("Part request phải là JSON hợp lệ", ex, input);
                }
            }

            @Override
            protected void writeInternal(RegisterPartnerRequest request, HttpOutputMessage output) {
                throw new UnsupportedOperationException("Converter chỉ dùng để đọc hồ sơ đăng ký");
            }
        });
    }
}
