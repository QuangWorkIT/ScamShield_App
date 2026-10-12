package com.be.scamshield.repository;

import com.be.scamshield.entity.EducationArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EducationArticleRepository extends JpaRepository<EducationArticle, Long>, JpaSpecificationExecutor<EducationArticle> {
    @Override
    @EntityGraph(attributePaths = "category")
    Page<EducationArticle> findAll(Specification<EducationArticle> specification, Pageable pageable);
}
