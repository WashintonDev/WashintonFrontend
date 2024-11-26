import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Select } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { auth } from "../../services/firebaseConfig";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const SignUp = () => {
  const Navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]); // Para almacenar las tiendas
  const [role, setRole] = useState(""); // Para gestionar el rol seleccionado
  const [storeId, setStoreId] = useState(null); // Para gestionar el store_id seleccionado

  // Obtener las tiendas disponibles
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("https://washintonbackend.store/api/store"); // Suponiendo que esta es la URL correcta para obtener tiendas
        setStores(response.data); // Suponiendo que la respuesta tiene un array de tiendas
      } catch (error) {
        console.error("Error fetching stores", error);
        message.error("Error fetching stores");
      }
    };
    fetchStores();
  }, []);

  // Esta función se dispara cuando se cambia el rol
  const handleRoleChange = (value) => {
    setRole(value);
    if (value !== "store") {
      setStoreId(null); // Si el rol no es 'store', limpiamos el storeId
    }
  };

  const onFinish = async (values) => {
    const { first_name, last_name, email, password, phone } = values;
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebase_user_ID = userCredential.user.uid;
      
      // Si el rol es 'admin', no se pasa store_id; si es 'store', se usa el seleccionado
      const store_id = role === "admin" ? null : storeId;

      // Llamamos a la función para registrar el usuario en la base de datos
      await registerUser({
        first_name, last_name, email, password, phone, role, firebase_user_ID, store_id
      });
      message.success("User registered successfully");
      Navigate('/');
    } catch (error) {
      message.error("Error registering user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async ({ first_name, last_name, email, password, phone, role, firebase_user_ID, store_id }) => {
    try {
      const location_type = role === "admin" ? "warehouse" : "store"; // Si es admin, location_type es warehouse
      const response = await axios.post('https://washintonbackend.store/api/user', {
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

          <Form.Item name="phone" rules={[{ required: true, message: "Please type your phone number" }, { len: 10, message: "Phone number must be 10 digits" },
              { pattern: /^[0-9]{10}$/, message: "Phone number must be numeric" }
            ]}>
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" size="large" />
          </Form.Item>

          <Form.Item name="role" rules={[{ required: true, message: "Please select a role" }]}>
            <Select placeholder="Select a role" size="large" onChange={handleRoleChange} value={role}>
              <Option value="admin">Admin</Option>
              <Option value="store">Store</Option>
            </Select>
          </Form.Item>

          {role === "store" && (
            <Form.Item
              name="store_id"
              rules={[{ required: role === "store", message: "Please select a store" }]}
            >
              <Select
                placeholder="Select a store"
                size="large"
                value={storeId || undefined} // Asegurando que el valor se muestre correctamente, incluso cuando sea null
                onChange={(value) => setStoreId(value)} // Aseguramos que el storeId se actualice
              >
                {stores.map((store) => (
                  <Option key={store.store_id} value={store.store_id}>{store.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

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
