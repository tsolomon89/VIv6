# Project Documentation

Welcome to the project documentation! This directory contains comprehensive guides on data structures, architecture patterns, and best practices.

## 📚 Documentation Index

### 1. [Data Models and Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md)
**Comprehensive guide covering:**
- Overview of Records vs Structs
- Complete data structure hierarchy
- Detailed data flow patterns
- Best practices and common patterns
- Real-world code examples
- State management guidelines

**Read this if you want to:**
- Understand the fundamental architecture
- Learn how data flows from database to UI
- See detailed examples with explanations
- Master best practices for data handling

**Time to read:** ~20 minutes

---

### 2. [Data Flow Quick Reference](DATA_FLOW_QUICK_REFERENCE.md)
**Quick lookup guide with:**
- When to use Records vs Structs
- Code snippet library
- Common conversion patterns
- Best practices checklist
- Debugging tips
- Anti-patterns to avoid

**Read this if you want to:**
- Quick reference during development
- Code snippets to copy/paste
- Fast answers to common questions
- Checklists for code review

**Time to read:** ~5 minutes (reference guide)

---

### 3. [Data Architecture Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md)
**Visual diagrams showing:**
- System architecture layers
- Data structure relationships
- Widget data flow diagrams
- Real-world component examples
- Complete flow visualizations
- Troubleshooting flowcharts

**Read this if you want to:**
- See visual representation of architecture
- Understand component relationships
- Follow data through the system visually
- Onboard new team members quickly

**Time to read:** ~15 minutes

---

## 🎯 Quick Start Guide

### For New Developers

1. **Start with:** [Data Models and Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) - Sections 1-3
   - Get the foundational concepts
   
2. **Then read:** [Data Architecture Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md)
   - See how it all connects visually
   
3. **Keep handy:** [Data Flow Quick Reference](DATA_FLOW_QUICK_REFERENCE.md)
   - Use this during daily development

### For Experienced Developers

1. **Skim:** [Data Architecture Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md)
   - Quickly understand the architecture
   
2. **Reference:** [Data Flow Quick Reference](DATA_FLOW_QUICK_REFERENCE.md)
   - Use for specific patterns and snippets

### For Code Reviews

Use the **Best Practices Checklist** in [Data Flow Quick Reference](DATA_FLOW_QUICK_REFERENCE.md)

---

## 🔍 Find What You Need

### "How do I..."

| Question | Document | Section |
|----------|----------|---------|
| "How do I fetch data from Firestore?" | [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) | Snippet #1 |
| "How do I pass data between widgets?" | [Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) | Data Flow Patterns |
| "How do I update nested structures?" | [Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) | Common Patterns |
| "How do I save data to Firestore?" | [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) | Snippet #8 |
| "How do I navigate with data?" | [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) | Snippet #9 |

### "What is..."

| Question | Document | Section |
|----------|----------|---------|
| "What is the difference between Record and Struct?" | [Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) | Records vs Structs |
| "What is the data hierarchy?" | [Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) | Data Structure Hierarchy |
| "What are the best practices?" | [Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) | Best Practices |
| "What should I avoid?" | [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) | Common Mistakes |

### "Show me..."

| Request | Document | Section |
|---------|----------|---------|
| "Show me the architecture diagram" | [Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) | System Overview |
| "Show me data flow examples" | [Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) | Widget Data Flow |
| "Show me code examples" | [Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) | Examples |
| "Show me quick snippets" | [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) | Code Snippets |

---

## 📖 Learning Path

### Level 1: Understanding (30 minutes)
1. Read [Data Models and Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) - Overview & Core Concepts
2. Review [Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) - System Overview
3. Understand: Records, Structs, and their purposes

### Level 2: Applying (1 hour)
1. Read [Data Models and Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) - Data Flow Patterns
2. Study code examples in existing widgets
3. Practice: Create a simple widget using structs

### Level 3: Mastering (2 hours)
1. Read [Data Models and Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) - Complete guide
2. Study [Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) - Real-World Examples
3. Practice: Build a dynamic form with nested data updates

### Level 4: Expert (Ongoing)
1. Keep [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) open during development
2. Review best practices regularly
3. Mentor others using these docs

---

## 🛠️ Common Tasks

### Task: Displaying Data from Firestore

**Steps:**
1. Use `StreamBuilder<List<DataRecord>>`
2. Extract struct: `record.recordStruct`
3. Pass to widget: `MyWidget(data: struct)`

**See:** [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) - Snippet #1

---

### Task: Creating a Dynamic Form

**Steps:**
1. Receive `RecordStruct` in widget
2. Navigate to `objectStruct.fieldGroupStructs`
3. Iterate and render based on `field.inputType`

**See:** [Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) - Example 2

---

### Task: Updating Nested Data

**Steps:**
1. Store struct in widget state
2. Create new struct instances (immutable)
3. Update state with new struct
4. Save to Firestore when ready

**See:** [Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) - Common Patterns

---

## 🐛 Troubleshooting

### Problem: Widget not showing data

**Solution Path:**
1. Check if `snapshot.hasData` is true
2. Verify struct extraction from record
3. Confirm struct is passed to widget
4. Check null safety on property access

**See:** [Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) - Troubleshooting Flowchart

---

### Problem: Null pointer exception

**Solution Path:**
1. Use `has*()` methods to check existence
2. Use safe accessors (return defaults)
3. Use null-aware operators (`?.`, `??`)
4. Check each level of nested access

**See:** [Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) - Best Practices #2

---

### Problem: Data not saving to Firestore

**Solution Path:**
1. Convert struct to Firestore data: `create*RecordData()`
2. Use correct document reference
3. Check Firestore rules
4. Verify struct has required fields

**See:** [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) - Snippet #8

---

## 📋 Checklists

### Code Review Checklist
- [ ] Using structs for widget parameters (not records)
- [ ] Extracting structs from records immediately after fetch
- [ ] Not storing records in widget state
- [ ] Using safe accessors for nullable fields
- [ ] Passing only the needed level of struct to children
- [ ] Using immutable update patterns for structs
- [ ] Proper null checks before accessing nested data

**See:** [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) - Best Practices Checklist

---

### New Feature Checklist
- [ ] Understand which struct level you need
- [ ] Check if similar widget exists
- [ ] Extract struct from record in StreamBuilder
- [ ] Pass struct to new widget
- [ ] Access properties safely
- [ ] Test with null/empty data
- [ ] Update documentation if pattern is new

---

## 🔗 Related Files

### Backend Schema
- `lib/backend/schema/*_record.dart` - Firestore Record definitions
- `lib/backend/schema/structs/*_struct.dart` - Struct definitions
- `lib/backend/schema/util/firestore_util.dart` - Firestore utilities
- `lib/backend/schema/util/schema_util.dart` - Schema utilities

### Example Widgets
- `lib/cards/card_dynamic/card_dynamic_widget.dart` - Card with structs
- `lib/bar_side/forms/` - Form components using nested structs
- `lib/pages/app/record_read_view/` - Full record display example

---

## 💡 Pro Tips

1. **Always use structs for UI** - Records are only for database operations
2. **Extract early** - Convert records to structs as soon as you fetch them
3. **Pass down specific levels** - Don't pass entire RecordStruct when child only needs FieldStruct
4. **Use safe accessors** - They return sensible defaults instead of null
5. **Keep it immutable** - Create new struct instances instead of modifying
6. **Cache computations** - Store filtered/sorted lists in state, not build method
7. **Check before accessing** - Use `has*()` methods for nested nullable fields
8. **Use const where possible** - Reduces unnecessary rebuilds

---

## 🤝 Contributing to Documentation

Found an issue or want to improve these docs?

1. Ensure accuracy with the current codebase
2. Include code examples where helpful
3. Keep language clear and concise
4. Add visual diagrams when explaining complex concepts
5. Update the index in this README

---

## 📞 Need Help?

If these documents don't answer your question:

1. Search the codebase for similar patterns
2. Check existing widgets for examples
3. Review the backend schema files
4. Ask the team with specific code references

---

## 🔄 Document Updates

These documents should be updated when:
- New struct types are added
- Data architecture patterns change
- New best practices are established
- Common issues are discovered

**Last Updated:** Current version matches project structure as of latest commit

---

## Summary

| Document | Purpose | Length | Best For |
|----------|---------|--------|----------|
| [Data Models and Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) | Comprehensive guide | 20 min | Learning & Reference |
| [Data Flow Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) | Quick snippets | 5 min | Daily Development |
| [Data Architecture Visual Guide](DATA_ARCHITECTURE_VISUAL_GUIDE.md) | Visual diagrams | 15 min | Understanding System |

---

**🎯 Start here:** If you're new to the project, begin with [Data Models and Widget Flow](DATA_MODELS_AND_WIDGET_FLOW.md) and refer to [Quick Reference](DATA_FLOW_QUICK_REFERENCE.md) during development.

**💡 Remember:** Records → Database, Structs → UI. This is the golden rule!
