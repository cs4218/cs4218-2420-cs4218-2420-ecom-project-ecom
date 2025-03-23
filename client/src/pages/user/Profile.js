import React, { useState, useEffect } from "react";
import UserMenu from "../../components/UserMenu";
import Layout from "./../../components/Layout";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import axios from "axios";
const Profile = () => {
  //context
  const [auth, setAuth] = useAuth();
  //state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

  //get user data
  useEffect(() => {
    const { email, name, phone, address } = auth?.user;
    setName(name);
    setPhone(phone);
    setEmail(email);
    setAddress(address);
  }, [auth?.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields directly in handleSubmit
    let tempErrors = {};
    let isValid = true;
  
    if (!name || name.trim() === '') {
      tempErrors.name = "Name is required";
      isValid = false;
    }
  
    if (!email || email.trim() === '') {
      tempErrors.email = "Email is required";
      isValid = false;
    }
  
    // Password can be empty (meaning no change), but if provided must be at least 6 chars
    if (password !== undefined && password !== "" && password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }
  
    if (!phone || phone.trim() === '') {
      tempErrors.phone = "Phone number is required";
      isValid = false;
    }
  
    if (!address || address.trim() === '') {
      tempErrors.address = "Address is required";
      isValid = false;
    }
  
    // Update the errors state
    setErrors(tempErrors);
    
    // If validation fails, show toast messages and return
    if (!isValid) {
      // Show a toast for each error message
      Object.values(tempErrors).forEach(errorMsg => {
        toast.error(errorMsg, { 
          duration: 4000,  // Duration in milliseconds
          position: 'top-center',
          // Use different IDs to ensure multiple toasts display simultaneously
          id: `error-${Math.random()}`,
        });
      });
      
      return;
    }
    
    // Continue with form submission
    try {
      const { data } = await axios.put("/api/v1/auth/profile", {
        name,
        email,
        password: password || undefined, // Only send password if it has a value
        phone,
        address,
      });
      
      if (data?.success) {
        // Update auth context with the new user data
        setAuth({ ...auth, user: data?.updatedUser });
        
        // Update localStorage
        let ls = localStorage.getItem("auth");
        ls = JSON.parse(ls);
        ls.user = data.updatedUser;
        localStorage.setItem("auth", JSON.stringify(ls));
        
        // Reset password field after successful update
        setPassword("");
        
        toast.success(data?.message || "Profile Updated Successfully");
      } else {
        // Handle error response from server
        toast.error(data?.message || "Update failed");
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    }
  };
  return (
    <Layout title={"Your Profile"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <div className="form-container ">
              <form onSubmit={handleSubmit}>
                <h4 className="title">USER PROFILE</h4>
                <div className="mb-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="Enter Your Name"
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="Enter Your Email "
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Enter Your Password"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="Enter Your Phone"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="Enter Your Address"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  UPDATE
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;