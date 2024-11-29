import { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Divider, Space, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { auth } from "../../services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import "../../assets/styles/login.css";
import { saveToken } from "../../services/authUtil";
import googleIcon from "../../assets/images/google.png";
import fetchUserRole from "../../services/fetchUserRole";

const { Title, Text, Link } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { email, password } = values;
    try {
      setLoading(true);

      // Iniciar sesión con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const token = await userCredential.user.getIdToken();
      const firebaseUserID = userCredential.user.uid; // Obtener el ID de Firebase

      // Guardar el token en localStorage
      saveToken(token);
      localStorage.setItem("user", email);

      // Obtener el rol desde el backend
      const role = await fetchUserRole(firebaseUserID);

      if (role) {
        localStorage.setItem("role", role);
        message.success("Login Successfully");
        window.location.href = "/";
      } else {
        throw new Error("No se pudo obtener el rol");
      }
    } catch (error) {
      console.error(error);
      message.error("Credenciales incorrectas o error al obtener rol");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <Title level={3}>Login</Title>

        <Form name="login" onFinish={onFinish} className="login-form">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email Address"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Checkbox>Keep me signed in</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              size="large"
              block
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <Divider>Or login with</Divider>
        <Space>
          <Button icon={<img src={googleIcon} alt="Google" className="icono" />} />
        </Space>
      </div>

      <Text type="secondary" className="login-footer">
        This site is protected by <Link href="/privacy-policy">Privacy Policy</Link>.
      </Text>
    </div>
  );
};

export default Login;