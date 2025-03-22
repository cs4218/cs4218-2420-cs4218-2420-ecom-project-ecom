import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import AdminMenu from '../../components/AdminMenu';

const Users = () => {
  const [users, setUsers] = useState([]); // State to store users

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/v1/auth/users"); // Adjust URL to your backend
      setUsers(response.data); // Update state with users
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>All Users</h1>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> 
    </Layout>
  );
};

export default Users;
