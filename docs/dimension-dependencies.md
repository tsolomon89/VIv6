# Dimension Dependencies

Dimensions supply categorical classifications (e.g., Department, Sector) for the system. `Dimension Dependencies` form a directed graph mapping relationships between these values to generate dynamic, cascading pick-lists.

## Schema Architecture

- `dimension_values`: The discrete values (e.g., "Engineering", "Software Engineer").
  - Identifies its category via `dimension` (e.g., "department", "job_title").
  - Supports self-referential `parent_id` for taxonomies (e.g., State -> City).
- `dimension_dependencies`: Maps horizontal relationships between separate dimensions.
  - Connects a `source_value_id` to a `target_value_id`.
  - Used for cascading filtering (e.g., if User selects Department "Engineering", the system filters Job Titles to only those dependent on "Engineering").

## Mechanics 

1. **Bidirectional Connections**: If configured as `bidirectional=1`, selecting the Target can also constrain the Source.
2. **Weight**: Allows for sorting or suggesting the most "probable" dependent values (e.g., `weight=100`).
3. **Targeting Endpoint**: Applications query `/api/dimensions/targeting` to discover which dimension combinations map to specific Personas or Records.
