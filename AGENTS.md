# Project architecture rules

- Use the existing HelmetProvider and SeoHead for per-page metadata; RouteSeoHead supplies uncovered routes without duplicating page-owned tags, because each rendered route needs one self-referencing canonical.
- Render FAQs with FaqList native details elements, keeping answers in the DOM when collapsed so text matches page JSON-LD and remains readable to search engines.