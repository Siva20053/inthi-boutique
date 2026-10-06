const express = require("express");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

app.post(
  "/api/admin/upload-image",
  authenticateAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);

        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed",
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "inthi",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      res.json({
        success: true,
        message: "Image uploaded successfully",
        image: {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        },
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }
  }
);


// ===============================
// Health Check
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inthi API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});



// ===============================
// Products
// ===============================

// ===============================
// Products
// ===============================

app.get("/api/products", async (req, res) => {
  try {
    const productsQuery = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.fabric,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at,

        c.id AS category_id,
        c.name AS category_name,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'sort_order', pi.sort_order
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'size', pv.size,
              'color', pv.color,
              'stock', pv.stock
            )
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'
        ) AS variants

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      LEFT JOIN product_images pi
        ON p.id = pi.product_id

      LEFT JOIN product_variants pv
        ON p.id = pv.product_id

      WHERE p.is_active = true

      GROUP BY
        p.id,
        c.id,
        c.name

      ORDER BY p.created_at DESC;
    `;

    const result = await pool.query(productsQuery);

    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });

  } catch (error) {
    console.error("Products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const productQuery = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.fabric,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.id AS category_id,
        c.name AS category_name,

        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'sort_order', pi.sort_order
              )
              ORDER BY pi.sort_order ASC
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'
        ) AS images,

        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', pv.id,
                'size', pv.size,
                'color', pv.color,
                'stock', pv.stock
              )
              ORDER BY pv.id ASC
            )
            FROM product_variants pv
            WHERE pv.product_id = p.id
          ),
          '[]'
        ) AS variants

      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE p.id = $1
        AND p.is_active = true

      LIMIT 1;
    `;

    const result = await pool.query(productQuery, [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Single product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT id, name, email, password_hash, is_active
      FROM admin_users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: "This admin account is inactive",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

app.get("/api/admin/me", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, is_active
      FROM admin_users
      WHERE id = $1
      LIMIT 1
      `,
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Admin verification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify admin",
    });
  }
});

// ============================================
// ADMIN ACCOUNT
// ============================================

// GET CURRENT ADMIN ACCOUNT
app.get(
  "/api/admin/account",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          is_active,
          created_at,
          updated_at
        FROM admin_users
        WHERE id = $1
        LIMIT 1;
        `,
        [req.admin.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Admin account not found",
        });
      }

      res.json({
        success: true,
        account: result.rows[0],
      });
    } catch (error) {
      console.error("Get admin account error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch admin account",
      });
    }
  }
);


// UPDATE ADMIN ACCOUNT
app.put(
  "/api/admin/account",
  authenticateAdmin,
  async (req, res) => {
    try {
      const {
        name,
        email,
        current_password,
        new_password,
      } = req.body;

      // Get current account
      const adminResult = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          password_hash
        FROM admin_users
        WHERE id = $1
        LIMIT 1;
        `,
        [req.admin.id]
      );

      if (adminResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Admin account not found",
        });
      }

      const admin = adminResult.rows[0];

      // Basic validation
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Check whether email belongs to another account
      const emailCheck = await pool.query(
        `
        SELECT id
        FROM admin_users
        WHERE LOWER(email) = LOWER($1)
          AND id <> $2
        LIMIT 1;
        `,
        [email.trim(), admin.id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "That email is already being used by another admin",
        });
      }

      let passwordHash = admin.password_hash;

      // Password change requested
      if (new_password && new_password.trim()) {
        if (!current_password) {
          return res.status(400).json({
            success: false,
            message:
              "Current password is required to change your password",
          });
        }

        const passwordMatches = await bcrypt.compare(
          current_password,
          admin.password_hash
        );

        if (!passwordMatches) {
          return res.status(401).json({
            success: false,
            message: "Current password is incorrect",
          });
        }

        if (new_password.length < 8) {
          return res.status(400).json({
            success: false,
            message:
              "New password must be at least 8 characters long",
          });
        }

        passwordHash = await bcrypt.hash(new_password, 12);
      }

      const updatedResult = await pool.query(
        `
        UPDATE admin_users
        SET
          name = $1,
          email = $2,
          password_hash = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING
          id,
          name,
          email,
          is_active,
          created_at,
          updated_at;
        `,
        [
          name.trim(),
          email.trim().toLowerCase(),
          passwordHash,
          admin.id,
        ]
      );

      res.json({
        success: true,
        message: "Admin account updated successfully",
        account: updatedResult.rows[0],
      });
    } catch (error) {
      console.error("Update admin account error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update admin account",
      });
    }
  }
);

app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        image_url,
        is_active,
        sort_order,
        created_at,
        updated_at
      FROM categories
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC;
    `);

    res.json({
      success: true,
      count: result.rows.length,
      categories: result.rows,
    });
  } catch (error) {
    console.error("Categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// =====================================================
// ADMIN - PRODUCTS
// =====================================================

// GET ALL PRODUCTS FOR ADMIN
app.get(
  "/api/admin/products",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.sale_price,
          p.category_id,
          p.fabric,
          p.is_featured,
          p.is_new_arrival,
          p.is_active,
          p.created_at,
          p.updated_at,

          c.name AS category_name,

          COALESCE(
            (
              SELECT json_agg(
                jsonb_build_object(
                  'id', pi.id,
                  'image_url', pi.image_url,
                  'sort_order', pi.sort_order
                )
                ORDER BY pi.sort_order ASC
              )
              FROM product_images pi
              WHERE pi.product_id = p.id
            ),
            '[]'
          ) AS images,

          COALESCE(
            (
              SELECT json_agg(
                jsonb_build_object(
                  'id', pv.id,
                  'size', pv.size,
                  'color', pv.color,
                  'stock', pv.stock
                )
                ORDER BY pv.id ASC
              )
              FROM product_variants pv
              WHERE pv.product_id = p.id
            ),
            '[]'
          ) AS variants

        FROM products p

        LEFT JOIN categories c
          ON p.category_id = c.id

        ORDER BY p.created_at DESC;
      `);

      res.json({
        success: true,
        count: result.rows.length,
        products: result.rows,
      });
    } catch (error) {
      console.error(
        "Admin products error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  }
);


// CREATE PRODUCT
app.post(
  "/api/admin/products",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const {
        name,
        description,
        price,
        sale_price,
        category_id,
        fabric,
        is_featured,
        is_new_arrival,
        is_active,
        images,
        variants,
      } = req.body;

      if (!name || price === undefined || !category_id) {
        return res.status(400).json({
          success: false,
          message:
            "Name, price and category are required",
        });
      }

      await client.query("BEGIN");

      const productResult = await client.query(
        `
        INSERT INTO products
          (
            name,
            description,
            price,
            sale_price,
            category_id,
            fabric,
            is_featured,
            is_new_arrival,
            is_active,
            created_at,
            updated_at
          )
        VALUES
          (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, NOW(), NOW()
          )
        RETURNING *;
        `,
        [
          name.trim(),
          description || "",
          Number(price),
          sale_price === "" ||
          sale_price === null ||
          sale_price === undefined
            ? null
            : Number(sale_price),
          Number(category_id),
          fabric || null,
          Boolean(is_featured),
          Boolean(is_new_arrival),
          is_active !== false,
        ]
      );

      const product =
        productResult.rows[0];

      // INSERT IMAGES
      if (Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          if (!images[i]) continue;

          await client.query(
            `
            INSERT INTO product_images
              (
                product_id,
                image_url,
                sort_order,
                created_at
              )
            VALUES ($1, $2, $3, NOW());
            `,
            [
              product.id,
              images[i],
              i + 1,
            ]
          );
        }
      }

      // INSERT VARIANTS
      if (Array.isArray(variants)) {
        for (const variant of variants) {
          if (
            !variant.size &&
            !variant.color
          ) {
            continue;
          }

          await client.query(
            `
            INSERT INTO product_variants
              (
                product_id,
                size,
                color,
                stock,
                created_at,
                updated_at
              )
            VALUES
              ($1, $2, $3, $4, NOW(), NOW());
            `,
            [
              product.id,
              variant.size || null,
              variant.color || null,
              Number(variant.stock) || 0,
            ]
          );
        }
      }

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Create product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    } finally {
      client.release();
    }
  }
);

// UPDATE PRODUCT
app.put(
  "/api/admin/products/:id",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const {
        name,
        description,
        price,
        sale_price,
        category_id,
        fabric,
        is_featured,
        is_new_arrival,
        is_active,
        images,
        variants,
      } = req.body;

      if (!name || price === undefined || !category_id) {
        return res.status(400).json({
          success: false,
          message:
            "Name, price and category are required",
        });
      }

      await client.query("BEGIN");

      const productResult = await client.query(
        `
        UPDATE products
        SET
          name = $1,
          description = $2,
          price = $3,
          sale_price = $4,
          category_id = $5,
          fabric = $6,
          is_featured = $7,
          is_new_arrival = $8,
          is_active = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING *;
        `,
        [
          name.trim(),
          description || "",
          Number(price),
          sale_price === "" ||
          sale_price === null ||
          sale_price === undefined
            ? null
            : Number(sale_price),
          Number(category_id),
          fabric || null,
          Boolean(is_featured),
          Boolean(is_new_arrival),
          is_active !== false,
          productId,
        ]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Replace images
      await client.query(
        "DELETE FROM product_images WHERE product_id = $1",
        [productId]
      );

      if (Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          if (!images[i]) continue;

          await client.query(
            `
            INSERT INTO product_images
              (
                product_id,
                image_url,
                sort_order,
                created_at
              )
            VALUES ($1, $2, $3, NOW());
            `,
            [
              productId,
              images[i],
              i + 1,
            ]
          );
        }
      }

      // Replace variants
      await client.query(
        "DELETE FROM product_variants WHERE product_id = $1",
        [productId]
      );

      if (Array.isArray(variants)) {
        for (const variant of variants) {
          if (
            !variant.size &&
            !variant.color
          ) {
            continue;
          }

          await client.query(
            `
            INSERT INTO product_variants
              (
                product_id,
                size,
                color,
                stock,
                created_at,
                updated_at
              )
            VALUES
              ($1, $2, $3, $4, NOW(), NOW());
            `,
            [
              productId,
              variant.size || null,
              variant.color || null,
              Number(variant.stock) || 0,
            ]
          );
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Product updated successfully",
        product: productResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Update product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    } finally {
      client.release();
    }
  }
);

// DEACTIVATE PRODUCT
app.delete(
  "/api/admin/products/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE products
        SET
          is_active = false,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, is_active;
        `,
        [productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product deactivated successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to deactivate product",
      });
    }
  }
);

// =====================================================
// PERMANENTLY DELETE PRODUCT
// =====================================================

app.delete(
  "/api/admin/products/:id/permanent",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      await client.query("BEGIN");

      // Check product exists
      const productResult = await client.query(
        `
        SELECT id, name
        FROM products
        WHERE id = $1
        LIMIT 1;
        `,
        [productId]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Delete product images
      await client.query(
        `
        DELETE FROM product_images
        WHERE product_id = $1;
        `,
        [productId]
      );

      // Delete product variants
      await client.query(
        `
        DELETE FROM product_variants
        WHERE product_id = $1;
        `,
        [productId]
      );

      // Finally delete product
      await client.query(
        `
        DELETE FROM products
        WHERE id = $1;
        `,
        [productId]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Product permanently deleted",
        product: productResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Permanent product deletion error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to permanently delete product",
      });
    } finally {
      client.release();
    }
  }
);

// =====================================================
// ADMIN - CATEGORIES
// =====================================================

// GET ALL CATEGORIES FOR ADMIN
app.get(
  "/api/admin/categories",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name,
          image_url,
          is_active,
          sort_order,
          created_at,
          updated_at
        FROM categories
        ORDER BY sort_order ASC, name ASC;
      `);

      res.json({
        success: true,
        count: result.rows.length,
        categories: result.rows,
      });
    } catch (error) {
      console.error(
        "Admin categories error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }
  }
);


// CREATE CATEGORY
app.post(
  "/api/admin/categories",
  authenticateAdmin,
  async (req, res) => {
    try {
      const {
        name,
        image_url,
        is_active,
        sort_order,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO categories
          (
            name,
            image_url,
            is_active,
            sort_order,
            created_at,
            updated_at
          )
        VALUES
          ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *;
        `,
        [
          name.trim(),
          image_url || null,
          is_active !== false,
          Number(sort_order) || 0,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        category: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create category error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to create category",
      });
    }
  }
);


// UPDATE CATEGORY
app.put(
  "/api/admin/categories/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const categoryId = Number(req.params.id);

      if (!Number.isInteger(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const {
        name,
        image_url,
        is_active,
        sort_order,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const result = await pool.query(
        `
        UPDATE categories
        SET
          name = $1,
          image_url = $2,
          is_active = $3,
          sort_order = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING *;
        `,
        [
          name.trim(),
          image_url || null,
          is_active !== false,
          Number(sort_order) || 0,
          categoryId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.json({
        success: true,
        message: "Category updated successfully",
        category: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update category error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update category",
      });
    }
  }
);


// DEACTIVATE CATEGORY
app.delete(
  "/api/admin/categories/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const categoryId = Number(req.params.id);

      if (!Number.isInteger(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE categories
        SET
          is_active = false,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, is_active;
        `,
        [categoryId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.json({
        success: true,
        message: "Category deactivated successfully",
        category: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to deactivate category",
      });
    }
  }
);

// =====================================================
// PERMANENTLY DELETE CATEGORY
// =====================================================

app.delete(
  "/api/admin/categories/:id/permanent",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const categoryId = Number(req.params.id);

      if (!Number.isInteger(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      await client.query("BEGIN");

      // Check category exists
      const categoryResult = await client.query(
        `
        SELECT id, name
        FROM categories
        WHERE id = $1
        LIMIT 1;
        `,
        [categoryId]
      );

      if (categoryResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      const category = categoryResult.rows[0];

      // Check whether products are using this category
      const productCountResult = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM products
        WHERE category_id = $1;
        `,
        [categoryId]
      );

      const productCount = productCountResult.rows[0].count;

      if (productCount > 0) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message:
            `Cannot delete "${category.name}" because ${productCount} ` +
            `product${productCount === 1 ? "" : "s"} are assigned to it. ` +
            `Move or delete those products first.`,
          product_count: productCount,
        });
      }

      // Safe to permanently delete
      await client.query(
        `
        DELETE FROM categories
        WHERE id = $1;
        `,
        [categoryId]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Category permanently deleted",
        category,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Permanent category deletion error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to permanently delete category",
      });
    } finally {
      client.release();
    }
  }
);

// =====================================================
// ADMIN - BANNERS
// =====================================================

// GET ALL BANNERS FOR ADMIN
app.get(
  "/api/admin/banners",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          image_url,
          heading,
          subheading,
          button_text,
          button_link,
          is_active,
          sort_order,
          created_at,
          updated_at
        FROM banners
        ORDER BY sort_order ASC, created_at DESC;
      `);

      res.json({
        success: true,
        count: result.rows.length,
        banners: result.rows,
      });
    } catch (error) {
      console.error("Admin banners error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch banners",
      });
    }
  }
);


// CREATE BANNER
app.post(
  "/api/admin/banners",
  authenticateAdmin,
  async (req, res) => {
    try {
      const {
        image_url,
        heading,
        subheading,
        button_text,
        button_link,
        is_active,
        sort_order,
      } = req.body;

      if (!image_url || !image_url.trim()) {
        return res.status(400).json({
          success: false,
          message: "Banner image is required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO banners
          (
            image_url,
            heading,
            subheading,
            button_text,
            button_link,
            is_active,
            sort_order,
            created_at,
            updated_at
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *;
        `,
        [
          image_url.trim(),
          heading?.trim() || null,
          subheading?.trim() || null,
          button_text?.trim() || null,
          button_link?.trim() || null,
          is_active !== false,
          Number(sort_order) || 0,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Banner created successfully",
        banner: result.rows[0],
      });
    } catch (error) {
      console.error("Create banner error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create banner",
      });
    }
  }
);


// UPDATE BANNER
app.put(
  "/api/admin/banners/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const bannerId = Number(req.params.id);

      if (!Number.isInteger(bannerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid banner ID",
        });
      }

      const {
        image_url,
        heading,
        subheading,
        button_text,
        button_link,
        is_active,
        sort_order,
      } = req.body;

      if (!image_url || !image_url.trim()) {
        return res.status(400).json({
          success: false,
          message: "Banner image is required",
        });
      }

      const result = await pool.query(
        `
        UPDATE banners
        SET
          image_url = $1,
          heading = $2,
          subheading = $3,
          button_text = $4,
          button_link = $5,
          is_active = $6,
          sort_order = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *;
        `,
        [
          image_url.trim(),
          heading?.trim() || null,
          subheading?.trim() || null,
          button_text?.trim() || null,
          button_link?.trim() || null,
          is_active !== false,
          Number(sort_order) || 0,
          bannerId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      res.json({
        success: true,
        message: "Banner updated successfully",
        banner: result.rows[0],
      });
    } catch (error) {
      console.error("Update banner error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update banner",
      });
    }
  }
);


// DEACTIVATE BANNER
app.delete(
  "/api/admin/banners/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const bannerId = Number(req.params.id);

      if (!Number.isInteger(bannerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid banner ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE banners
        SET
          is_active = false,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, heading, is_active;
        `,
        [bannerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      res.json({
        success: true,
        message: "Banner deactivated successfully",
        banner: result.rows[0],
      });
    } catch (error) {
      console.error("Delete banner error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to deactivate banner",
      });
    }
  }
);

// =====================================================
// PERMANENTLY DELETE BANNER
// =====================================================

app.delete(
  "/api/admin/banners/:id/permanent",
  authenticateAdmin,
  async (req, res) => {
    try {
      const bannerId = Number(req.params.id);

      if (!Number.isInteger(bannerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid banner ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM banners
        WHERE id = $1
        RETURNING id, heading, image_url;
        `,
        [bannerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      res.json({
        success: true,
        message: "Banner permanently deleted",
        banner: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Permanent banner deletion error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to permanently delete banner",
      });
    }
  }
);

// =====================================================
// PUBLIC - STORE SETTINGS
// =====================================================

app.get("/api/settings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        store_name,
        whatsapp,
        phone,
        instagram,
        email,
        address,
        maps_url,
        opening_hours,
        logo_url,
        whatsapp_template
      FROM store_settings
      ORDER BY id ASC
      LIMIT 1;
    `);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        settings: null,
      });
    }

    res.json({
      success: true,
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("Store settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch store settings",
    });
  }
});

// UPDATE STORE SETTINGS - ADMIN ONLY
app.put(
  "/api/admin/settings",
  authenticateAdmin,
  async (req, res) => {
    try {
      const {
        store_name,
        whatsapp,
        phone,
        instagram,
        email,
        address,
        maps_url,
        opening_hours,
        logo_url,
        whatsapp_template,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE store_settings
        SET
          store_name = $1,
          whatsapp = $2,
          phone = $3,
          instagram = $4,
          email = $5,
          address = $6,
          maps_url = $7,
          opening_hours = $8,
          logo_url = $9,
          whatsapp_template = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = (
          SELECT id
          FROM store_settings
          ORDER BY id ASC
          LIMIT 1
        )
        RETURNING
          id,
          store_name,
          whatsapp,
          phone,
          instagram,
          email,
          address,
          maps_url,
          opening_hours,
          logo_url,
          whatsapp_template,
          created_at,
          updated_at;
        `,
        [
          store_name || "",
          whatsapp || "",
          phone || "",
          instagram || "",
          email || "",
          address || "",
          maps_url || "",
          opening_hours || "",
          logo_url || "",
          whatsapp_template || "",
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Store settings not found",
        });
      }

      res.json({
        success: true,
        message: "Store settings updated successfully",
        settings: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Admin settings update error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update store settings",
      });
    }
  }
);

// =====================================================
// PUBLIC - BANNERS
// =====================================================

app.get("/api/banners", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        image_url,
        heading,
        subheading,
        button_text,
        button_link,
        sort_order
      FROM banners
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at DESC;
    `);

    res.json({
      success: true,
      count: result.rows.length,
      banners: result.rows,
    });
  } catch (error) {
    console.error("Public banners error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
    });
  }
});

// ============================================
// ADMIN FORGOT PASSWORD
// ============================================

app.post(
  "/api/admin/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const adminResult = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          is_active
        FROM admin_users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1;
        `,
        [normalizedEmail]
      );

      /*
       * Always return the same response whether the
       * email exists or not.
       *
       * This prevents people from discovering which
       * email addresses have admin accounts.
       */
      if (
        adminResult.rows.length === 0 ||
        !adminResult.rows[0].is_active
      ) {
        return res.json({
          success: true,
          message:
            "If an admin account exists with that email, a password reset link has been sent.",
        });
      }

      const admin = adminResult.rows[0];

      // Generate a cryptographically secure token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Store only the hash in PostgreSQL
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Token valid for 30 minutes
      const expiresAt = new Date(
        Date.now() + 30 * 60 * 1000
      );

      await pool.query(
        `
        UPDATE admin_users
        SET
          password_reset_token_hash = $1,
          password_reset_expires_at = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3;
        `,
        [
          resetTokenHash,
          expiresAt,
          admin.id,
        ]
      );

      /*
       * IMPORTANT:
       * Change this after deployment to your real
       * production frontend URL.
       */
      const frontendUrl =
        process.env.CLIENT_URL ||
        "http://localhost:3000";

      const resetUrl =
        `${frontendUrl}/admin/reset-password?token=${resetToken}`;

      const { Resend } = require("resend");

      if (!process.env.RESEND_API_KEY) {
        console.error(
          "RESEND_API_KEY is not configured"
        );

        return res.status(500).json({
          success: false,
          message:
            "Password reset email service is not configured",
        });
      }

      const resend = new Resend(
        process.env.RESEND_API_KEY
      );

      await resend.emails.send({
        from:
          process.env.ADMIN_RESET_FROM ||
          "Inthi Admin <onboarding@resend.dev>",

        to: [admin.email],

        subject: "Reset your Inthi Admin password",

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #111;">
            
            <h2 style="margin-bottom: 8px;">
              Inthi Admin
            </h2>

            <p>
              Hello ${admin.name || "Admin"},
            </p>

            <p>
              We received a request to reset your
              Inthi Admin password.
            </p>

            <p>
              Click the button below to create a new password.
            </p>

            <div style="margin: 30px 0;">
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  background: #000;
                  color: #fff;
                  text-decoration: none;
                  padding: 12px 22px;
                  border-radius: 5px;
                  font-size: 14px;
                "
              >
                Reset Password
              </a>
            </div>

            <p style="font-size: 13px; color: #666;">
              This link will expire in 30 minutes
              and can only be used once.
            </p>

            <p style="font-size: 13px; color: #666;">
              If you did not request this password reset,
              you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

            <p style="font-size: 12px; color: #999;">
              This is an automated email from Inthi Admin.
            </p>

          </div>
        `,
      });

      res.json({
        success: true,
        message:
          "If an admin account exists with that email, a password reset link has been sent.",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      /*
       * Don't expose internal email/provider errors
       * to the user.
       */
      res.status(500).json({
        success: false,
        message:
          "Unable to process the password reset request",
      });
    }
  }
);


// ============================================
// ADMIN RESET PASSWORD
// ============================================

app.post(
  "/api/admin/reset-password",
  async (req, res) => {
    try {
      const {
        token,
        new_password,
      } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Reset token is required",
        });
      }

      if (!new_password) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters long",
        });
      }

      // Hash the token received from the reset link
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const adminResult = await pool.query(
        `
        SELECT
          id,
          is_active
        FROM admin_users
        WHERE password_reset_token_hash = $1
          AND password_reset_expires_at > CURRENT_TIMESTAMP
        LIMIT 1;
        `,
        [resetTokenHash]
      );

      if (adminResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      const admin = adminResult.rows[0];

      if (!admin.is_active) {
        return res.status(403).json({
          success: false,
          message:
            "This admin account is inactive.",
        });
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(
        new_password,
        12
      );

      // Update password AND invalidate reset token
      await pool.query(
        `
        UPDATE admin_users
        SET
          password_hash = $1,
          password_reset_token_hash = NULL,
          password_reset_expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
        `,
        [
          passwordHash,
          admin.id,
        ]
      );

      res.json({
        success: true,
        message:
          "Password has been reset successfully. You can now log in.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to reset password",
      });
    }
  }
);

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===============================
// Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
  console.log(`Inthi API running on http://localhost:${PORT}`);
});

