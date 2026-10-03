package com.be.scamshield.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaginatedResponse<T> {
    private List<T> data;
    private int currentPage;
    private long totalItems;
    private int totalPages;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;

    public static <T> PaginatedResponse<T> buildPaginatedResponse(Page<T> page) {
        PaginatedResponse<T> response = new PaginatedResponse<>();
        response.setData(page.getContent());
        response.setCurrentPage(page.getNumber());
        response.setTotalItems(page.getTotalElements());
        response.setPageSize(page.getSize());
        response.setTotalPages(page.getTotalPages());
        response.setHasNext(page.hasNext());
        response.setHasPrevious(page.hasPrevious());
        return response;
    }
}
