import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, notification, Select } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined, ShopOutlined } from "@ant-design/icons";
import { auth } from "../../services/firebaseConfig";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "../../assets/styles/login.css";
import { useNavigate } from "react-router-dom";
import { API_URL_USERS } from "../../services/ApisConfig"; 

const { Title, Text, Link } = Typography;
const { Option } = Select;

const SignUp = () => {
  const Navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    const { first_name, last_name, email, password, phone, role } = values;
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
      const firebase_user_ID = userCredential.user.uid; 
      console.log(firebase_user_ID);
      
      await registerUser({ first_name, last_name,password, email, phone, role, firebase_user_ID });
      message.success("User registered successfully");
      Navigate('/')
    } catch (error) {
      message.error("Error registering user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL_USERS}`); /// cambiaar por la url de la api
      if (!response.ok) throw new Error("Error fetching users");
      const data = await response.json();
      const uniqueRoles = Array.from(new Set(data.map((user) => user.role)));
      setRoles(uniqueRoles);
      console.log(data);
    } catch (error) {
      notification.error({ message: error.message || "Error fetching users" });
    }
  };

  const registerUser = async ({ first_name, last_name, email,password, phone, role, firebase_user_ID }) => {
    try {
      const store_id = role === "admin" ? null : "specific_store_id";  // Si es admin, no se asigna store_id
      const location_type = role === "admin" ? "warehouse" : "store";  // Si es admin, location_type es warehouse
  
      // Realiza la llamada POST al backend
      const response = await axios.post(`${API_URL_USERS}`, { // Cambiar por la url de la api 
        first_name,
        last_name,
        email,
        password,
        phone,
        role,
        location_type, 
        status: "active",
        store_id, 
        firebase_user_ID, 
      });
  
      console.log("Usuario registrado correctamente en la base de datos", response.data);
  
    } catch (error) {
      if (error.response) {
        console.error("Error al registrar usuario:", error.response.data);
        throw new Error("Error registering user: " + error.response.data.message || error.response.data);
      } else {
        console.error("Error sin respuesta:", error);
        throw new Error("Error registering user: " + error.message);
      }
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-box">
        <Title level={3}>Sign Up</Title>
        <Form name="signup" onFinish={onFinish} className="login-form">
          <Form.Item name="first_name" rules={[{ required: true, message: "Type Your First Name" }]}>
            <Input prefix={<UserOutlined />} placeholder="First Name" size="large" />
          </Form.Item>

          <Form.Item name="last_name" rules={[{ required: true, message: "Type Your Last Name" }]}>
            <Input prefix={<UserOutlined />} placeholder="Last Name" size="large" />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, message: "Please enter your email" }]}>
            <Input prefix={<MailOutlined />} placeholder="Email Address" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please enter your password" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("The two passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>

          <Form.Item name="phone" rules={[{ required: true, message: "Please type your phone number" } ,{ len: 10, message: "Phone number must be 10 digits" },
              { pattern: /^[0-9]{10}$/, message: "Phone number must be numeric" }
            ]}>
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" size="large" />
          </Form.Item>

          <Form.Item name="role" rules={[{ required: true, message: "Please select a role" }]}>
            <Select placeholder="Select a role" size="large">
              {roles.map((role) => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="store_id" rules={[{ required: false }]}>
            <Input prefix={<ShopOutlined />} placeholder="Store ID" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" size="large" block loading={loading}>
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Text type="secondary" className="login-footer">
        By signing up, you agree to our <Link href="/terms-and-conditions">Terms and Conditions</Link>.
      </Text>
    </div>
  );
};

export default SignUp;
