import React, { useState } from 'react';
import { Card, Text, Button, Dialog, Flex, TextField, Select } from '@radix-ui/themes';
import { Users, Plus, Search, Eye, EyeOff } from 'lucide-react';
import { createUser, CreateUserPayload, getUsers, User, deleteUser, updateUser, UpdateUserPayload } from '@/services/user.services';

type CreateUserForm = Omit<CreateUserPayload, 'age'> & { age: string };
const initialForm: CreateUserForm = {
  fullname: '',
  age: '',
  address: '',
  username: '',
  password: '',
  status_role: 'user',
};

const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(initialForm);
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, address: '' }));
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
    if (form.password !== confirmPassword) {
      setError('Password and Confirm Password do not match');
      setLoading(false);
      return;
    }
    try {
      const payload = { ...form, age: Number(form.age), address: '' };
      const res = await createUser(payload);
      if (res.success) {
        setSuccess('User created successfully!');
        setForm(initialForm);
        setConfirmPassword('');
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
    if (editForm.password && editForm.password !== editConfirmPassword) {
      alert('Password and Confirm Password do not match');
      return;
    }
    setEditLoading(true);
    try {
      const payload = { ...editForm, address: '' };
      const res = await updateUser(payload);
      if (res.success) {
        setEditUser(null);
        setEditForm(null);
        setEditConfirmPassword('');
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
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 border border-gray-200">
          {/* Icon + Title + Description */}
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="bg-green-100 p-3 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-10 h-10 text-green-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold text-gray-900 truncate tracking-tight">User Management</h1>
              <p className="mt-1 text-gray-500 truncate text-base">Manage and organize your system users</p>
            </div>
          </div>
          {/* Search + Create User Button */}
          <div className="flex w-full lg:w-auto gap-3 items-center mt-4 lg:mt-0">
            {/* Search Box with Button */}
            <form className="flex items-center w-full lg:w-72 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <Search className="w-4 h-4 text-green-500 ml-3" />
              <input
                type="text"
                placeholder="Search by name..."
                className="outline-none flex-1 bg-transparent text-gray-700 placeholder-gray-400 px-2 py-2"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg w-8 h-8 flex items-center justify-center mx-1 shadow-md focus:outline-none transition-colors"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </form>
            {/* Create User Button (open modal) */}
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger>
                <Button size="3" className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 rounded-lg shadow-md flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
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
                  <div className="relative">
                    <TextField.Root
                      name="password"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <TextField.Root
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
        <Card className="p-6 shadow-xl rounded-2xl border border-gray-200">
          {loadingUsers ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm rounded-xl overflow-hidden shadow-md bg-white">
                <thead>
                  <tr className="bg-white text-gray-800 text-base">
                    <th className="px-4 py-3 border-b font-semibold text-center">No.</th>
                    <th className="px-4 py-3 border-b font-semibold text-center">Full Name</th>
                    <th className="px-4 py-3 border-b font-semibold text-center">Username</th>
                    <th className="px-4 py-3 border-b font-semibold text-center">Role</th>
                    <th className="px-4 py-3 border-b font-semibold text-center">Age</th>
                    <th className="px-4 py-3 border-b font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.users_id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 border-b text-center">{idx + 1}</td>
                      <td className="px-4 py-2 border-b text-center">{u.fullname}</td>
                      <td className="px-4 py-2 border-b text-center">{u.username}</td>
                      <td className="px-4 py-2 border-b capitalize text-center">{u.status_role}</td>
                      <td className="px-4 py-2 border-b text-center">{u.age}</td>
                      <td className="px-4 py-2 border-b text-center flex flex-col sm:flex-row gap-2 justify-center items-center">
                        <button
                          onClick={() => openEdit(u)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteUserId(u.users_id)}
                          className="bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors"
                          type="button"
                        >
                          Delete
                        </button>
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
            <div className="relative">
              <TextField.Root
                name="password"
                placeholder="Password (fill to change)"
                type={showEditPassword ? "text" : "password"}
                value={editForm?.password || ''}
                onChange={handleEditChange}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowEditPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showEditPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {editForm?.password && (
              <div className="relative">
                <TextField.Root
                  name="editConfirmPassword"
                  placeholder="Confirm Password"
                  type={showEditConfirmPassword ? "text" : "password"}
                  value={editConfirmPassword}
                  onChange={e => setEditConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowEditConfirmPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showEditConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}
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