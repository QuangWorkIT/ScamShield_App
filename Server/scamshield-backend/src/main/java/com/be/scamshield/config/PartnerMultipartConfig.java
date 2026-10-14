package com.be.scamshield.config;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverters;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class PartnerMultipartConfig implements WebMvcConfigurer {
    private final ObjectMapper objectMapper;

    public PartnerMultipartConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void configureMessageConverters(HttpMessageConverters.ServerBuilder builder) {
        // Swagger and FormData may omit Content-Type on the JSON form field.
        builder.addCustomConverter(new AbstractHttpMessageConverter<Object>(
                MediaType.TEXT_PLAIN, MediaType.APPLICATION_OCTET_STREAM) {
            @Override
            protected boolean supports(Class<?> type) {
                return type.getPackageName() != null && type.getPackageName().startsWith("com.be.scamshield.dto");
            }

            @Override
            public boolean canWrite(Class<?> type, MediaType mediaType) {
                return false;
            }

            @Override
            protected Object readInternal(Class<? extends Object> type,
                    HttpInputMessage input) throws IOException {
                try {
                    return objectMapper.readValue(input.getBody(), type);
                } catch (JacksonException ex) {
                    throw new HttpMessageNotReadableException("Part request phải là JSON hợp lệ", ex, input);
                }
            }

            @Override
            protected void writeInternal(Object request, HttpOutputMessage output) {
                throw new UnsupportedOperationException("Converter chỉ dùng để đọc multipart JSON");
            }
        });
    }
}
