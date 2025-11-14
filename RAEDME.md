# Precision-Safe Rendering of Large-Coordinate CAD Drawings in Three.js

Rendering AutoCAD drawings in the browser using Three.js becomes challenging when geometries contain **extremely large coordinates** — often in the range of **10⁸ to 10⁹**.  
This README explains:

1. Why large coordinates break rendering precision  
2. How different engines (especially **Cesium**) solve this problem  
3. Why applying transforms on existing Three.js geometry **does not** fix precision loss  
4. The correct solution implemented in this project: **re-centering coordinates *before* geometry creation**

---

# 1. The Large-Coordinate Precision Problem

JavaScript (and WebGL) use **64‑bit floating point numbers** for CPU-side calculations, but GPU shaders typically use **32‑bit floats**, which only have **24 bits of precision** and **~7 decimal digits** of precision.

Given coordinate around **1e9**,

```
1e9 ≈ 2³⁰
```

The smallest step (ULP = Unit in Last Place) is:

```
ULP = 2^(exponent - 23) = 2^(30 - 23) = 2^7 = 128
```

So float32 at 1e9 increments in units of 128. It means any difference smaller than 128 is completely lost. In other words:

- 1,000,000,001 → stored as 1,000,000,000
- 1,000,000,050 → stored as 1,000,000,000
- 1,000,000,127 → stored as 1,000,000,000
- 1,000,000,128 → finally becomes different

So float32 can only represent values like:

- ..., 
- 999,999,872
- 1,000,000,000
- 1,000,000,128
- 1,000,000,256
- ...


Everything in between is not representable.

### Geometry Example

Suppose you are trying to generate a circle with radius 1000 and 128 segments:

```ts
const centerX = 4 * 1e8;   // 400,000,000
const centerY = 4 * 1e8;
```

A point on the circle is:

```
x = 400,000,000 + cos(theta) * 1000
```

But `cos(theta) * 1000 ≈ 1000` has **only 4 digits**, while the center has **9 digits**.  
When these are added, the GPU cannot retain the smaller differences:

```
400,000,000 + 1000   →   400,000,000  (precision lost!)
```

### Result in Three.js

Even if your math uses **128 segments**, the rendered geometry appears as if it has **only 16–20 segments** because all points collapse onto a coarse approximation.

---

# 2. Why Post-Transforming Geometry Does NOT Work

Three.js lets you apply transformations like:

```ts
geometry.applyMatrix4(translationMatrix)
```

You might think:

> “I’ll generate geometry with huge coordinates first,  
> then translate everything to smaller coordinates using a transform.”

This approach **does not work** because:

### ❌ Precision is already lost during geometry creation.

If the original vertices were:

```
(400000000, 400000000)
(400000999, 400000520)
(399999500, 400000865)
```

The GPU sees them as:

```
(400000000, 400000000)
(400000000, 400000000)
(400000000, 400000000)
```

Translating zero-precision data still leaves zero-precision results.

---

# 3. How Engines Like Cesium Solve This

Cesium is designed specifically for **planet-scale** visualization.  
It uses two major techniques:

## 3.1 Camera-relative Rendering (The “Origin Shift” technique)

Cesium stores coordinates internally in **double precision**, but every frame it subtracts the camera position:

```
renderPos = worldPos - cameraPos
```

Because the camera is always near the origin, GPU receives **small numbers**, avoiding precision loss.

## 3.2 Encoded Double-Precision Attributes

Cesium splits each coordinate into:

```
high bits (stored in one float)
low bits  (stored in another float)
```

Then recombines them in shaders.  
This enables **true 64-bit coordinate precision** even on WebGL.

---

# 4. The Solution Used in This Project

We adopt a simpler but effective version of the “origin-shift” idea:

# ✔ Recompute geometry using **re-centered coordinates** BEFORE creating any Three.js geometry.

### Steps:

1. Compute the bounding box of all CAD data.
2. Compute the center point of that box.
3. Treat that point as **the new origin (0,0)**.
4. Recompute every geometry (circle, polyline, etc.) using:
   ```
   worldCoord - basePoint
   ```
5. Store `basePoint` and add it back for coordinate conversions (mouse interactions, snapping, measurements).

This ensures:

- All rendering uses **small coordinates**  
- No precision loss during geometry generation  
- Perfectly smooth circles even with extremely large original coordinates

---

# 5. A Numerical Example (Real Data)

Original circle center:

```
center = (400,000,000, 400,000,000)
radius = 1000
segments = 128
```

If vertices are computed directly:

```
center.x + cos(theta) * 1000
≈ precision lost → visible polygon has ~20 segments
```

### After re-centering

Assume bounding box center equals `(400,000,000, 400,000,000)`.

Recomputed coordinates:

```
newCenter = (0,0)
x = cos(theta) * 1000
```

These values are small and precise → circle renders smoothly with all 128 segments.

---

# 6. Why Scene.rebase() (Transform After Creation) Fails

`Scene.rebase()` applies a transformation matrix to geometry *after* creation:

```ts
geometry.applyMatrix4(object3D.matrix)
geometry.applyMatrix4(translationMatrix)
```

But by this point:

- GPU precision has already collapsed  
- Vertex data is already truncated  
- Applying transforms does not restore missing precision  

Hence:

### ❌ Even after rebasing, the circle still looks like it has 20 segments.

---

# 7. The Correct Approach in Code

## 7.1 Avoid transforming existing geometry  
Instead, **store a basePoint**:

```ts
this._basePoint = new THREE.Vector2();
```

## 7.2 Recompute geometry using shifted coordinates

```ts
createCircleLine(
  10e8 * 4 - basePoint.x,
  10e8 * 4 - basePoint.y,
  1000
);
```

## 7.3 Recompute everything when basePoint changes

```ts
set basePoint(value) {
  this._basePoint.copy(value);
  this.clear();
  this.buildDraw();   // rebuild geometry with new origin
}
```

## 7.4 Rebase UI: compute new basePoint from scene bounding box

```ts
rebase() {
  const box = this._scene.box;
  const center = new THREE.Vector3();
  box.getCenter(center);
  this._drawing.basePoint = new THREE.Vector2(center.x, center.y);
}
```

---

# 8. Summary

| Approach | Works? | Why |
|---------|--------|------|
| Translate geometry after creation | ❌ No | Precision loss has already happened |
| Scene graph transform (object.position) | ❌ No | GPU still sees huge world coordinates |
| Recenter and recreate geometry | ✔ Yes | All geometry computed with small numbers |
| Cesium-style origin shifting | ✔ Yes | Gold standard for large-world rendering |

---

# 9. Conclusion

Large-coordinate data from CAD or GIS systems cannot be rendered correctly in Three.js without special handling, because GPU precision is limited.  
The correct approach is:

### **Always compute geometry using precision-safe, re-centered coordinates.**

This project implements that approach by:

- Computing a `basePoint` (dynamic origin)
- Rebuilding geometry using offset coordinates
- Returning to original coordinates for interaction APIs

This ensures pixel-perfect rendering even when working with CAD drawings containing coordinates in the range of 1e8–1e9 or higher.

---

If you need an extended article, diagrams, or additional explanations (e.g., double-precision shader implementation), feel free to ask!
