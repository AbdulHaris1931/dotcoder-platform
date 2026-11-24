# Implementation Plan: Next.js Image Optimization & Performance Hardening

## Overview
Migrate all raw `<img>` instances across the application to Next.js `<Image />` (`next/image`) with strict domain whitelisting, explicit layout dimensions, and above-the-fold priority loading to eliminate Cumulative Layout Shift (CLS) and maximize Largest Contentful Paint (LCP).

## Architecture & Configuration
1. **`next.config.mjs`:**
   - Whitelist `images.unsplash.com` under `images.remotePatterns`.
   - Retain existing security headers (HSTS, X-Frame-Options, etc.).
2. **Component & Page Modifications:**
   - `src/app/page.tsx`: Convert 4 Unsplash learner avatars to `<Image width={32} height={32} ... />`.
   - `src/app/student/resume/page.tsx`: Convert student avatar to `<Image width={80} height={80} ... />`.
   - `src/components/shared/dotcoder-logo.tsx`: Convert `/logo.png` to `<Image width={36} height={36} priority={true} ... />`.
   - `src/components/shared/navbar.tsx`: Convert `/logo.png` to `<Image width={32} height={32} priority={true} ... />`.
   - `src/components/shared/global-loading-screen.tsx`: Convert `/logo.png` to `<Image width={96} height={96} priority={true} ... />`.
   - `src/components/ide/split-pane-ide.tsx`: Convert `/logo.png` to `<Image width={28} height={28} priority={true} ... />`.
   - `src/app/student/exam/[id]/page.tsx`: Convert `/logo.png` to `<Image width={28} height={28} priority={true} ... />`.
   - `src/app/student/exam/[id]/simulator/page.tsx`: Convert `/logo.png` to `<Image width={24} height={24} priority={true} ... />`.
   - `src/app/verify/[credentialId]/page.tsx`: Convert `/logo.png` to `<Image width={20} height={20} ... />`.

## Verification Gates
1. `npm run lint` -> Zero `@next/next/no-img-element` warnings.
2. `npx tsc --noEmit` -> Zero TypeScript compiler errors.
3. `npm run build` -> 100% build pass across all 24 routes.
