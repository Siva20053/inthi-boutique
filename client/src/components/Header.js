import React, { useState } from "react";
import {
  HiMenu,
  HiX,
  HiSearch,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const productData = useSelector(
    (state) => state.bazar.productData
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchText.trim();

    if (!query) return;

    navigate(`/shop?search=${encodeURIComponent(query)}`);

    setSearchText("");
    setSearchOpen(false);
    closeMenu();
  };

  const openSearch = () => {
    setSearchOpen(true);
    setMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-xl h-16 sm:h-20 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex-shrink-0"
        >
          <div className="text-2xl sm:text-3xl font-semibold tracking-[0.15em]">
            INTHI
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">

            <li>
              <Link
                to="/"
                className="text-sm tracking-wide text-gray-800 hover:text-black transition"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/shop"
                className="text-sm tracking-wide text-gray-800 hover:text-black transition"
              >
                Shop
              </Link>
            </li>

            <li>
              <Link
                to="/shop?filter=new"
                className="text-sm tracking-wide text-gray-800 hover:text-black transition"
              >
                New Arrivals
              </Link>
            </li>

            <li>
              <Link
                to="/categories"
                className="text-sm tracking-wide text-gray-800 hover:text-black transition"
              >
                Categories
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="text-sm tracking-wide text-gray-800 hover:text-black transition"
              >
                Contact Us
              </Link>
            </li>



          </ul>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 sm:gap-5">

          {/* SEARCH */}
          <button
            type="button"
            onClick={openSearch}
            className="text-xl text-gray-800 hover:text-black transition"
            aria-label="Search"
          >
            <HiSearch />
          </button>

          {/* BAG */}
          <Link
            to="/cart"
            className="relative text-gray-800 hover:text-black transition"
            aria-label="Shopping bag"
          >
            <HiOutlineShoppingBag className="text-2xl" />

            {productData.length > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                {productData.length}
              </span>
            )}
          </Link>

          {/* MOBILE MENU */}
          <button
            type="button"
            className="lg:hidden text-2xl text-gray-800"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen(!menuOpen);
              setSearchOpen(false);
            }}
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>

        </div>
      </div>

      {/* SEARCH PANEL */}
      {searchOpen && (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3"
            >
              <HiSearch className="text-xl text-gray-500" />

              <input
                type="text"
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
                autoFocus
                placeholder="Search products..."
                className="flex-1 outline-none text-sm sm:text-base"
              />

              <button
                type="submit"
                className="px-5 py-2 bg-black text-white text-sm hover:bg-gray-800 transition"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchText("");
                }}
                className="text-gray-500 hover:text-black"
                aria-label="Close search"
              >
                <HiX className="text-xl" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-gray-200 bg-white">
          <ul className="px-5 py-5 flex flex-col">

            <li>
              <Link
                onClick={closeMenu}
                to="/"
                className="block py-3 text-sm tracking-wide"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                onClick={closeMenu}
                to="/shop"
                className="block py-3 text-sm tracking-wide"
              >
                Shop
              </Link>
            </li>

            <li>
              <Link
                onClick={closeMenu}
                to="/shop?filter=new"
                className="block py-3 text-sm tracking-wide"
              >
                New Arrivals
              </Link>
            </li>

            <li>
              <Link
                onClick={closeMenu}
                to="/categories"
                className="block py-3 text-sm tracking-wide"
              >
                Categories
              </Link>
            </li>

            <li>
              <Link
                onClick={closeMenu}
                to="/contact"
                 className="block py-3 text-sm tracking-wide"
              >
                  Contact Us
              </Link>
            </li>

          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;