import React, { useEffect, useState } from 'react';
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant
} from '../api/restaurants';
import { useAuth } from '../context/AuthContext';

const AdminRestaurants = () => {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    description: ''
  });

  const loadRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load restaurants');
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await createRestaurant(createForm, token);
      setCreateForm({ name: '', description: '' });
      await loadRestaurants();
    } catch (err) {
      console.error(err);
      setError('Failed to create restaurant');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (r) => {
    setEditForm({
      id: r.id || r._id,
      name: r.name || '',
      description: r.description || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setUpdatingId(editForm.id);
    try {
      await updateRestaurant(editForm.id, {
        name: editForm.name,
        description: editForm.description
      }, token);
      setEditForm({ id: '', name: '', description: '' });
      await loadRestaurants();
    } catch (err) {
      console.error(err);
      setError('Failed to update restaurant');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h2 className="page-title">Admin: Restaurants</h2>
      {error && <div className="error">{error}</div>}

      <h3>Create Restaurant</h3>
      <form onSubmit={handleCreate}>
        <div className="form-row">
          <label className="label">Name</label>
          <input
            value={createForm.name}
            onChange={(e) =>
              setCreateForm({ ...createForm, name: e.target.value })
            }
          />
        </div>
        <div className="form-row">
          <label className="label">Description</label>
          <textarea
            rows={2}
            value={createForm.description}
            onChange={(e) =>
              setCreateForm({ ...createForm, description: e.target.value })
            }
          />
        </div>
        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      <h3 className="mt-16">Existing Restaurants</h3>
      {restaurants.map((r) => (
        <div key={r.id || r._id} className="card">
          <div className="flex-between">
            <div>
              <strong>{r.name}</strong>
              {r.description && (
                <div className="small">{r.description}</div>
              )}
            </div>
            <button onClick={() => startEdit(r)}>Edit</button>
          </div>
        </div>
      ))}

      {editForm.id && (
        <div className="mt-16">
          <h3>Edit Restaurant</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <label className="label">Name</label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="form-row">
              <label className="label">Description</label>
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value
                  })
                }
              />
            </div>
            <button type="submit" disabled={!!updatingId}>
              {updatingId ? 'Updating...' : 'Update'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;
