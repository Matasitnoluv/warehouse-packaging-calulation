import React, { useState } from 'react';
import { Card, Text, Button, Dialog, Flex, TextField, Select } from '@radix-ui/themes';
import { Users, Plus, Search } from 'lucide-react';
import { createUser, CreateUserPayload, getUsers, User, deleteUser, updateUser, UpdateUserPayload } from '@/services/user.services';

const initialForm: CreateUserPayload = {
  fullname: '',
  age: 18,
  address: '',
  username: '',
  password: '',
  status_role: 'user',
};

const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserPayload | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'age' ? Number(value) : value, address: '' }));
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getUsers();
      if (res.success) setUsers(res.responseObject);
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = { ...form, address: '' };
      const res = await createUser(payload);
      if (res.success) {
        setSuccess('User created successfully!');
        setForm(initialForm);
        setOpen(false);
        fetchUsers();
      } else {
        setError(res.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ ...user, password: '' });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => prev ? { ...prev, [name]: name === 'age' ? Number(value) : value, address: '' } : null);
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setEditLoading(true);
    try {
      const payload = { ...editForm, address: '' };
      const res = await updateUser(payload);
      if (res.success) {
        setEditUser(null);
        setEditForm(null);
        fetchUsers();
      } else {
        alert(res.message || 'Failed to update user');
      }
    } finally {
      setEditLoading(false);
    }
  };
  // Delete handlers
  const handleDelete = async () => {
    if (!deleteUserId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteUser(deleteUserId);
      if (res.success) {
        setDeleteUserId(null);
        fetchUsers();
      } else {
        alert(res.message || 'Failed to delete user');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6">
          {/* Icon + Title + Description */}
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="bg-green-100 p-3 rounded-xl flex items-center justify-center">
              <Users className="w-10 h-10 text-green-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                User Management
              </h1>
              <p className="mt-2 text-gray-600 truncate">
                Manage and organize your system users
              </p>
            </div>
          </div>
          {/* Search + Create User Button */}
          <div className="flex w-full lg:w-auto gap-3 items-center mt-4 lg:mt-0">
            {/* Search Box with Button */}
            <form className="flex items-center w-full lg:w-72 bg-white border border-gray-300 rounded-lg overflow-hidden">
              <Search className="w-4 h-4 text-green-500 ml-3" />
              <input
                type="text"
                placeholder="Search by name..."
                className="outline-none flex-1 bg-transparent text-gray-700 placeholder-gray-400 px-2 py-2"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 focus:outline-none"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </form>
            {/* Create User Button (open modal) */}
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger>
                <Button size="2" className="bg-green-500 hover:bg-green-600 text-white font-bold px-4">
                  <Plus className="w-4 h-4 mr-1" />
                  Create User
                </Button>
              </Dialog.Trigger>
              <Dialog.Content style={{ maxWidth: 400 }}>
                <Dialog.Title>Create User</Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                  <TextField.Root
                    name="fullname"
                    placeholder="Full Name"
                    value={form.fullname}
                    onChange={handleChange}
                    required
                  />
                  <TextField.Root
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  <TextField.Root
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <TextField.Root
                    name="age"
                    placeholder="Age"
                    type="number"
                    min={1}
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                  <Select.Root name="status_role" value={form.status_role} onValueChange={v => setForm(f => ({ ...f, status_role: v }))}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="user">User</Select.Item>
                      <Select.Item value="manager">Manager</Select.Item>
                      <Select.Item value="admin">Admin</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  {error && <Text color="red">{error}</Text>}
                  <Flex gap="3" mt="2" justify="end">
                    <Dialog.Close>
                      <Button type="button" variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button type="submit" loading={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold">Create</Button>
                  </Flex>
                </form>
              </Dialog.Content>
            </Dialog.Root>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <Text size="5" weight="bold" mb="4">User List</Text>
          {loadingUsers ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 border">No.</th>
                    <th className="px-4 py-2 border">Full Name</th>
                    <th className="px-4 py-2 border">Username</th>
                    <th className="px-4 py-2 border">Role</th>
                    <th className="px-4 py-2 border">Age</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.users_id} className="even:bg-gray-50">
                      <td className="px-4 py-2 border text-center">{idx + 1}</td>
                      <td className="px-4 py-2 border">{u.fullname}</td>
                      <td className="px-4 py-2 border">{u.username}</td>
                      <td className="px-4 py-2 border capitalize">{u.status_role}</td>
                      <td className="px-4 py-2 border text-center">{u.age}</td>
                      <td className="px-4 py-2 border text-center">
                        <Button size="1" variant="soft" color="blue" onClick={() => openEdit(u)} className="mr-2">Edit</Button>
                        <Button size="1" variant="soft" color="red" onClick={() => setDeleteUserId(u.users_id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog.Root open={!!editUser} onOpenChange={v => { if (!v) { setEditUser(null); setEditForm(null); } }}>
        <Dialog.Content style={{ maxWidth: 400 }}>
          <Dialog.Title>Edit User</Dialog.Title>
          <form onSubmit={handleEditSubmit} className="space-y-3 mt-2">
            <TextField.Root
              name="fullname"
              placeholder="Full Name"
              value={editForm?.fullname || ''}
              onChange={handleEditChange}
              required
            />
            <TextField.Root
              name="username"
              placeholder="Username"
              value={editForm?.username || ''}
              onChange={handleEditChange}
              required
            />
            <TextField.Root
              name="password"
              placeholder="Password (fill to change)"
              type="password"
              value={editForm?.password || ''}
              onChange={handleEditChange}
            />
            <TextField.Root
              name="age"
              placeholder="Age"
              type="number"
              min={1}
              value={editForm?.age || ''}
              onChange={handleEditChange}
              required
            />
            <Select.Root name="status_role" value={editForm?.status_role || ''} onValueChange={v => setEditForm(f => f ? { ...f, status_role: v } : null)}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="user">User</Select.Item>
                <Select.Item value="manager">Manager</Select.Item>
                <Select.Item value="admin">Admin</Select.Item>
              </Select.Content>
            </Select.Root>
            <Flex gap="3" mt="2" justify="end">
              <Dialog.Close>
                <Button type="button" variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" loading={editLoading} className="bg-blue-500 hover:bg-blue-600 text-white font-bold">Save</Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
      {/* Delete User Confirm Dialog */}
      <Dialog.Root open={!!deleteUserId} onOpenChange={v => { if (!v) setDeleteUserId(null); }}>
        <Dialog.Content style={{ maxWidth: 350 }}>
          <Dialog.Title>Delete User</Dialog.Title>
          <Text>Are you sure you want to delete this user?</Text>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button type="button" variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button color="red" loading={deleteLoading} onClick={handleDelete}>Delete</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default UserManagement; 