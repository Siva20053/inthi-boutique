import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Banner from "./components/Banner";
import CategoriesSection from "./components/CategoriesSection";
import Products from "./components/Products";

const Home = () => {
  const data = useLoaderData();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(data?.products || []);
  }, [data]);

  return (
    <div>
      <Banner />
      <CategoriesSection />
      <Products products={products} />
    </div>
  );
};

export default Home;