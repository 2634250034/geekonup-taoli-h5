# AGENTS.md

## Project Overview

This is a lightweight H5 sharing page project. The main flow reads parameters from the shared link, requests backend APIs with those parameters, and renders teacher-related conversion content.

Core features include:

- Recommended teacher/course list
- Teacher profile and introduction
- Student reviews
- Available lesson time selection and appointment booking
- WeChat payment
- Course planning content written by teachers for students, rendered from API data

Keep the product experience focused, fast, and mobile-first. Avoid adding infrastructure or abstractions that are not needed for this small H5 scenario.

## Tech Stack

- Vite
- Vue 3
- TypeScript
- Vue Router
- Less for styles
- No third-party UI component library
- Theme color: `#1D5CF0`

## Development Preferences

- Prefer TypeScript over JavaScript.
- Use Vue 3 Composition API.
- Use `<script setup lang="ts">` in Vue SFCs.
- Prefer focused, readable modules over large mixed-purpose files.
- Add comments only when they clarify non-obvious business logic.
- Preserve existing project style and naming conventions.
- Minimize unrelated changes.

## Styling Guidelines

- Use Less, not SCSS, for new styles in this project.
- Avoid inline styles.
- Prefer scoped component styles unless a style is intentionally global.
- Use semantic HTML where practical.
- Design mobile-first, then adapt to larger screens if needed.
- Use flex/grid layouts for structure.
- Keep spacing, typography, and states consistent.
- Use `#1D5CF0` as the primary theme color. Prefer centralizing it as a Less variable or CSS custom property before repeated use.
- Do not introduce a third-party UI library. Build lightweight local components instead.

## Suggested Code Organization

Keep files small and purpose-driven. Introduce folders only when they are useful:

- `src/api/` for typed API request functions
- `src/components/` for reusable UI pieces
- `src/views/` for page-level views
- `src/composables/` for reusable Composition API logic
- `src/types/` for shared TypeScript types
- `src/utils/` for small pure helpers

Avoid creating broad framework-like layers unless the project actually needs them.

## API And Data Flow

- Read share-link parameters from Vue Router or `URLSearchParams`.
- Validate required query parameters before making requests.
- Use typed async API functions and `async/await`.
- Keep request parameter names and response types clear.
- Handle loading, empty, error, and retry states.
- Render API data defensively because H5 share links may be stale or incomplete.
- Do not hardcode user identifiers, payment identifiers, tokens, or environment-specific API hosts in components.

## Feature Notes

### Recommended List

- Keep list item components reusable and compact.
- Handle empty recommendation data gracefully.
- Avoid blocking the whole page if only the recommendation section fails.

### Teacher Introduction

- Keep profile, teaching highlights, and course details visually scannable on mobile.
- Avoid oversized desktop-style layouts.

### Student Reviews

- Support missing avatars, names, ratings, or review text.
- Keep long comments from breaking the layout.

### Available Time And Appointment

- Clearly distinguish available, selected, disabled, and booked states.
- Prevent duplicate appointment submissions.
- Keep appointment API calls typed and isolated from UI rendering code.

### WeChat Payment

- Treat payment as a backend-driven flow.
- Use payment parameters returned by the API.
- Prevent repeated payment clicks while a payment request is pending.
- Handle success, cancellation, failure, and unsupported environment states.
- Do not log sensitive payment data.

### Course Planning

- Render teacher-written planning content from the API without assuming every field exists.
- Keep rich or multi-section planning content readable on small screens.
- Avoid unsafe HTML rendering unless the backend content is trusted and sanitized.

## Components

- Split reusable UI into focused components.
- Prefer props and typed emits for component contracts.
- Keep page components responsible for orchestration, not low-level presentation details.
- Avoid global state unless multiple independent pages genuinely need it.

## Commands

Use the existing package scripts:

- `pnpm dev` to start local development
- `pnpm build` to type-check and build
- `pnpm lint` to run lint fixes
- `pnpm format` to format source files

Before finishing meaningful code changes, run the most relevant checks. For UI or behavior changes, prefer at least `pnpm build`.

## Before Editing

- Read related files first.
- Check existing patterns before introducing new ones.
- Keep changes scoped to the requested feature or fix.
- Do not rewrite unrelated files.
- Preserve user changes in the working tree.
