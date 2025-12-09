"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import CollectionProductCard from "@/app/components/CollectionProductCard";
import api from "@/api/api";

export default function CollectionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // === Fetch data awal ===
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/brands"),
        ]);
        const allProducts = prodRes.data.data || prodRes.data;
        const allCategories = catRes.data.data || catRes.data;
        const allBrands = brandRes.data.data || brandRes.data;
        setProducts(allProducts);
        setCategories(allCategories);
        setBrands(allBrands);
        setFilteredProducts(allProducts);
      } catch (err) {
        console.error("❌ Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // === Terapkan filter otomatis ===
  useEffect(() => {
    let filtered = [...products];

    if (category) filtered = filtered.filter((p) => p.category_id == category);
    if (brand) filtered = filtered.filter((p) => p.brand_id == brand);
    if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "sold-desc":
        filtered.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    }

    setFilteredProducts(filtered);
  }, [products, category, brand, sortBy, minPrice, maxPrice]);

  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-28 border-b border-gray-200 mt-20 px-6 bg-[url('/images/banner1.png')] bg-cover bg-center bg-fixed relative"
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <h1 className="text-[15px] font-bold tracking-[3px] uppercase text-gray-700 mb-3">
            Chronova
          </h1>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            The Modern Collection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-[17px] leading-relaxed">
            Explore precision, elegance, and craftsmanship — curated exclusively
            for modern collectors.
          </p>
        </div>
      </motion.section>

      {/* ===== MAIN SECTION ===== */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        {/* === SIDEBAR === */}
        <aside className="space-y-6 sticky top-28 h-fit border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-800 text-lg mb-2">
            Filter & Sorting
          </h3>

          {/* Brand */}
          <div>
            <p className="text-sm font-medium mb-2 text-gray-600">Brand</p>
            <select
              onChange={(e) => setBrand(e.target.value)}
              value={brand}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <p className="text-sm font-medium mb-2 text-gray-600">Kategori</p>
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <p className="text-sm font-medium mb-2 text-gray-600">Rentang Harga</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Sorting */}
          <div>
            <p className="text-sm font-medium mb-2 text-gray-600">Urutkan</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">Terbaru</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="sold-desc">Paling Laris</option>
            </select>
          </div>

          {/* Clear Filter */}
          <button
            onClick={() => {
              setCategory("");
              setBrand("");
              setSortBy("newest");
              setMinPrice("");
              setMaxPrice("");
            }}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Reset Filter
          </button>
        </aside>

        {/* === PRODUCT GRID === */}
        <div>
          {loading ? (
            <p className="text-gray-500 text-center">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500">Tidak ada produk ditemukan.</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Ditemukan {filteredProducts.length} produk
              </p>
              <motion.div
                layout
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10"
              >
                {filteredProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="transform hover:scale-[1.02] transition duration-300"
                  >
                    <CollectionProductCard
                      product={p}
                      className="!h-[480px] !rounded-2xl shadow-lg hover:shadow-2xl transition"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
