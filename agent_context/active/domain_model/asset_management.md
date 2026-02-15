# Asset Management: The Semantic Content Layer

> **Principle**: An Asset is not just a file. It is a **Semantic Node** in the graph, linking *Content* to *Context*.
> **Goal**: To track the performance of creative work across Channels and Mediums.

## 1. The Asset Taxonomy
An Asset is defined by *where* it lives (Source), *how* it is distributed (Channel), and *what* form it takes (Medium).

### A. Core Properties
- **Headline**: The primary hook (Max 90 chars).
- **Body**: The core content (Text, HTML, or Reference).
- **Format**: The technical format (e.g., `image/png`, `text/html`).

### B. The Attribution Triad
Every Asset lives within this coordinate system:

1.  **Source** (Placement): The specific location (e.g., `domain.com/blog/article-1`).
2.  **Channel** (Distribution): How the Source distributes the content.
    - `social` (LinkedIn, Twitter)
    - `display` (Ads)
    - `search` (SEO, PPC)
    - `email` (Newsletters, Cold Outbound)
    - `website` (Landing Pages)
    - `event` (Booth, Talk)
3.  **Medium** (Form Factor):
    - `ad` (Text + Image/Video variable)
    - `post` (Social Feed Item)
    - `article` (Long form, 1500+ chars)
    - `message` (Direct communication)
    - `document` (PDF, Deck, Whitepaper)
    - `visual` (Image, Video, Component)
    - `page` (Web Page)
    - `presentation` (Slides)

### C. Referral Type (The Cost Model)
- **Paid**: The placement has a direct monetary cost (CPM/CPC).
- **Organic**: The placement costs only time/effort.

## 2. Asset Groups (Segmentation)
Assets are rarely standalone. They are grouped to target specific segments.

- **Asset Group Focus**: The Product/Feature/Solution this group promotes.
- **Asset Group Audience**: The Segment targeting (e.g., "Healthcare + VP").
- **Keywords**: Semantic tags combining Focus + Audience.

> **Example**: "Healthcare VPs (Audience) for Reporting Engine (Focus)" -> Keyword: "Healthcare Analytics ROI".

## 3. Versioning & Experimentation
Assets are mutable and experimental.

- **Version**: A specific iteration of the Asset.
- **A/B Test**: A field tracking split-test variants.
- **Status**: `draft` -> `active` -> `archived`.

> **Logic**: The system tracks performance (Conversion %) at the *Version* level, but aggregates it at the *Asset* level. "Winning" versions replace the default.

## 4. Integration with Workflow
Assets are the "Payload" of Engagement Activities.
- **Step 1**: Send `Asset(Email_Welcome_v1)`.
- **Step 2**: If `Click(Asset_Link)`, then Send `Asset(Case_Study_PDF)`.

## 5. Derived Pages (The Website)
As defined in `INVENTORY-SCHEMA-NOTES.md`, the Website is a *derivative* of the Asset Library.
- **Product Page**: An Asset of type `page` linked to `Product`.
- **Feature Page**: An Asset of type `page` linked to `Feature`.
- **Solution Page**: An Asset of type `page` linked to `Solution`.
