# Layout Structure Mockup

## 1. Overall Layout

```
+------------------------------------------+
|                                          |
|           Nate's AI Battle Cards         |
|                                          |
+------------------------------------------+
|                                          |
|  +----------------+  +----------------+  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |    Card Grid   |  |   Preview      |  |
|  |    (Scroll)    |  |   Panel        |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  |                |  |                |  |
|  +----------------+  +----------------+  |
|                                          |
+------------------------------------------+
|                                          |
|        Read Nate's Substack story        |
|                                          |
+------------------------------------------+
```

## 2. Card Grid Layout

```
+----------------+
|  +--+  +--+   |
|  |  |  |  |   |
|  +--+  +--+   |
|                |
|  +--+  +--+   |
|  |  |  |  |   |
|  +--+  +--+   |
|                |
|  +--+  +--+   |
|  |  |  |  |   |
|  +--+  +--+   |
|                |
|  +--+  +--+   |
|  |  |  |  |   |
|  +--+  +--+   |
+----------------+
```

## 3. Preview Panel Layout

```
+----------------+
|                |
|    +------+    |
|    |      |    |
|    | Card |    |
|    |      |    |
|    +------+    |
|                |
|  Card Details  |
|                |
|  - Title       |
|  - Description |
|  - Metadata    |
|                |
+----------------+
```

## 4. Card States

### 4.1 Normal State
```
+------+
|      |
|Front |
|      |
+------+
```

### 4.2 Selected State (Grid)
```
+------+
|      |
| Back |
|      |
+------+
```

### 4.3 Preview State
```
+----------+
|          |
|  Front   |
|          |
+----------+
```

## 5. Responsive Behavior

### 5.1 Desktop (Default)
```
+----------------+  +----------------+
|                |  |                |
|    Card Grid   |  |   Preview      |
|    (Scroll)    |  |   Panel        |
|                |  |                |
+----------------+  +----------------+
```

### 5.2 Tablet
```
+----------------+
|                |
|    Card Grid   |
|    (Scroll)    |
|                |
+----------------+
|                |
|   Preview      |
|   Panel        |
|                |
+----------------+
```

### 5.3 Mobile
```
+----------------+
|                |
|    Card Grid   |
|    (Scroll)    |
|                |
+----------------+
|                |
|   Preview      |
|   Panel        |
|                |
+----------------+
```

## 6. Interaction States

### 6.1 Hover State
```
+------+  (Elevation + Cursor)
|      |
|Front |
|      |
+------+
```

### 6.2 Selected State
```
+------+  (Highlighted Border)
|      |
| Back |
|      |
+------+
```

### 6.3 Preview State
```
+----------+  (150% Scale)
|          |
|  Front   |
|          |
+----------+
```

## 7. Animation States

### 7.1 Flip Animation
```
Front → [Rotation] → Back
  0°  →    90°    → 180°
```

### 7.2 Preview Update
```
[Fade Out] → [Update] → [Fade In]
   0%     →   50%    →   100%
```

## 8. Scroll Behavior

### 8.1 Grid Panel
```
+----------------+
|                |
|    Card Grid   | ← Scrolls
|    (Scroll)    |
|                |
+----------------+
```

### 8.2 Preview Panel
```
+----------------+
|                |
|   Preview      | ← Stays Centered
|   Panel        |
|                |
+----------------+
``` 