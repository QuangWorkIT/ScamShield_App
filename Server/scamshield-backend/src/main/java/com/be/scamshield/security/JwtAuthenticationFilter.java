package com.be.scamshield.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                String username = tokenProvider.getUsernameFromJWT(jwt);

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token", ex);
            if (continueWithoutAuthenticationOnAuthPath(request, response, filterChain)) {
                return;
            }
            handleAuthenticationFailure(request, response, "Token expired", ex);
            return;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT token", ex);
            if (continueWithoutAuthenticationOnAuthPath(request, response, filterChain)) {
                return;
            }
            handleAuthenticationFailure(request, response, "Invalid token", ex);
            return;
        } catch (BadCredentialsException ex) {
            log.error("Could not set user authentication in security context", ex);
            if (continueWithoutAuthenticationOnAuthPath(request, response, filterChain)) {
                return;
            }
            handleAuthenticationFailure(request, response, ex.getMessage(), ex);
            return;
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
            if (continueWithoutAuthenticationOnAuthPath(request, response, filterChain)) {
                return;
            }
            handleAuthenticationFailure(request, response, "Invalid token", ex);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void handleAuthenticationFailure(HttpServletRequest request,
                                             HttpServletResponse response,
                                             String message,
                                             Exception ex) throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        unauthorizedHandler.commence(
                request,
                response,
                new BadCredentialsException(message, ex)
        );
    }

    private boolean continueWithoutAuthenticationOnAuthPath(HttpServletRequest request,
                                                            HttpServletResponse response,
                                                            FilterChain filterChain) throws ServletException, IOException {
        if (!isAuthPath(request)) {
            return false;
        }
        SecurityContextHolder.clearContext();
        filterChain.doFilter(request, response);
        return true;
    }

    private boolean isAuthPath(HttpServletRequest request) {
        String path = request.getServletPath();
        if (!StringUtils.hasText(path)) {
            path = request.getRequestURI();
        }
        return "/api/auth".equals(path) || path.startsWith("/api/auth/");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
