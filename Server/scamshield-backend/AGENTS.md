# ScamShield Project AI Guidelines

You are an AI coding assistant working on the ScamShield project.
Please adhere strictly to the following rules for all code generation, refactoring, and file modifications in the backend.

## 1. API Response Format (MANDATORY)

- **NEVER** return raw data types (String, Integer, custom Entity) directly from a REST Controller.
- **ALWAYS** wrap all API responses inside `com.be.scamshield.dto.BaseResponse<T>`.
  - Example for Success: `return ResponseEntity.ok(new BaseResponse<>(true, "Success message", data));`
  - Example for Failure: `return ResponseEntity.badRequest().body(new BaseResponse<>(false, "Error message", null));`
- If the endpoint returns no data, use `BaseResponse<Void>` and pass `null` as the data parameter.
- If the endpoint returns a list with pagination, use `com.be.scamshield.dto.PaginatedResponse<T>` as the data payload inside `BaseResponse`.

## 2. Controllers & Swagger Documentation

- Every new Controller must have a `@Tag(name = "...", description = "...")` annotation from `io.swagger.v3.oas.annotations.tags.Tag`.
- Each endpoint should ideally be documented with `@Operation(summary = "...", description = "...")`.
- Use standard `@RestController` and `@RequestMapping("/api/...")`.

## 3. Security

- Never save plain-text passwords. Always use `PasswordEncoder` (BCrypt) before saving a `User` entity.
- Endpoints that do not require authentication must be explicitly added to `SecurityConfig.java` in the `.requestMatchers(...).permitAll()` section.

## 4. Entity & DTO Mapping

- Do not use Entities directly as Request Bodies. Always create a Request DTO (e.g., in `com.be.scamshield.dto.request`).
- Do not expose sensitive Entity fields (like `passwordHash`) in Response DTOs.
- Use `Lombok` annotations (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`) to minimize boilerplate.

## 5. Dependency Injection

- Always use constructor injection with Lombok's `@RequiredArgsConstructor` for Services and Controllers instead of `@Autowired`.

## 6. Request Validation (GlobalExceptionHandler)

- ALWAYS use `jakarta.validation.constraints` (`@NotBlank`, `@Email`, `@Size`, etc.) on DTO fields.
- Include custom Vietnamese error messages in the annotations: e.g. `@NotBlank(message = "Không được để trống")`.
- ALWAYS annotate Controller parameters with `@Valid` to trigger the `GlobalExceptionHandler` which will automatically return field errors mapped in the `BaseResponse`.

## 7. Production-Ready Libraries

- ALWAYS choose libraries and tools that are production-ready and easily deployable (e.g., standard Spring Boot starters, Twilio for SMS, standard JavaMailSender for Emails). Avoid hacky or development-only workarounds for core features.

## 8. Environment Variables & Secrets

- NEVER hardcode sensitive information (passwords, API keys, tokens) in `application.yml` or Java source code.
- ALWAYS use `${ENV_VARIABLE_NAME}` syntax in `application.yml`.
- Store the actual values in the `.env` file (which is git-ignored) and provide a template in `.env.example`.
- Ensure that the `.env` file is placed in the correct root directory of the backend project (`Server/scamshield-backend/`) so that `spring-dotenv` can read it automatically.

Follow these rules unconditionally whenever generating code for this workspace.

## 9. Clean up temporary files

- ALWAYS delete any temporary scripts, scratchpad code, or temporary test files (like `HashGenTest.java`) immediately after they have served their purpose.

## 10. Code Style & Imports

- ALWAYS import classes and annotations properly at the top of the file using standard `import` statements (e.g. `import io.swagger.v3.oas.annotations.Operation;`).
- NEVER use fully qualified class names inline within the code (e.g. avoid `@io.swagger.v3.oas.annotations.Operation(...)`) unless there is an unavoidable naming collision.
