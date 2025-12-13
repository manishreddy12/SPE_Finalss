import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants } from '../api/restaurants';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurants();
        setRestaurants(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  if (loading) return <div>Loading restaurants...</div>;

  return (
    <div>
      <h2 className="page-title">Restaurants</h2>
      {error && <div className="error">{error}</div>}
      {restaurants.length === 0 && <div>No restaurants available.</div>}
      {restaurants.map((r) => (
        <div key={r.id || r._id} className="card">
          <div className="flex-between">
            <div>
              <strong>{r.name}</strong>
              {r.description && (
                <div className="small"> {r.description}</div>
              )}
            </div>
            <Link to={`/restaurants/${r.id || r._id}`}>
              <button>View Menu</button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantList;
