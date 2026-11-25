import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './WishlistPage.css';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist || data || []);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      await api.post('/wishlist/toggle', { productId });
      setWishlist((prev) => prev.filter((item) => (item.product_id || item.productId || item.id) !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div className="wishlist-page container">
      <h1 className="section-title">MY <span className="gradient-text">WISHLIST</span></h1>
      <p className="section-subtitle">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>

      {wishlist.length === 0 ? (
        <div className="cart-empty">
          <FiHeart size={64} />
          <h2>Your Wishlist is Empty</h2>
          <p>Save products you love for later</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-4">
          {wishlist.map((item) => {
            const product = item.product || item;
            return (
              <ProductCard
                key={product.id || item.id}
                product={product}
                isWishlisted={true}
                onToggleWishlist={() => toggleWishlist(product.id || item.product_id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
