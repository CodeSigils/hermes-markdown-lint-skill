# kitchensink — The Ultimate Markdown Test

A comprehensive test file for markdown linting. Contains every GFM element.

---

## 1. Headings

### Level 3

#### Level 4

##### Level 5

###### Level 6

## 2. Paragraphs

This is a paragraph with some text.
This should be on a new line but isn't.

Another paragraph here with multiple sentences. It has plenty of content to test line wrapping behavior.

## 3. Lists

### Unordered

- Item one
- Item two
- Item three
  - Nested item
  - Another nested
- Back to root

### Ordered

1. First step
2. Second step
3. Third step
   1. Nested step
   2. Another nested
4. Back to root

### Task Lists

- [x] Done task
- [ ] Pending task
- [x] Another done

## 4. Code Blocks

### Fenced with language

```python
def hello():
    print("Hello, World!")
```

### Fenced without language

```javascript
function hello()
  console.log("Hello")
```

### Indented code

```python
def hello():
    print("Hello")
```

## 5. Tables

| Header A | Header B | Header C |
| :------- | :------- | :------- |
| Cell A1  | Cell B1  | Cell C1  |
| Cell A2  | Cell B2  | Cell C2  |

### Aligned columns

| Left | Center | Right |
| :--- | :----: | ----: |
| L    |   C    |     R |

## 6. Blockquotes

> This is a blockquote
> Multiple lines
> With a blank line in the middle
>
> ## Blockquote with heading
>
> And some text

## 7. Horizontal Rules

---

---

---

## 8. Links

[Inline link](https://example.com)

[Reference link][ref]

[ref]: https://example.org

### Auto-links

<https://example.net>
<test@example.com>

## 9. Emphasis

_italic_ and _italic_

**bold** and **bold**

**_bold italic_**

~~strikethrough~~

## 10. Images

![Alt text](https://example.com/image.png)

## 11. Inline Code

Use `code` in text.

Use backticks: `code with backticks`

## 12. HTML

```html
<details>
  <summary>Click to expand</summary>
  Hidden content here.
</details>

<br />
```

## 13. Definition Lists

Term 1
: Definition 1

Term 2
: Definition 2

## 14. Footnotes

Here is a footnote[^1].

[^1]: This is the footnote.

## 15. Abbreviations

\*[HTML]: HyperText Markup Language

The HTML standard defines this.

## THE END
