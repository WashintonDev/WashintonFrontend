import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Divider, Space, message } from "antd";
import Icon, { MailOutlined, LockOutlined } from "@ant-design/icons";
import { auth } from "../../services/firebaseConfig"; // Asegúrate de tener la configuración de Firebase correctamente importada
import { createUserWithEmailAndPassword } from "firebase/auth";
import "../../assets/styles/login.css";
import googleIcon from "../../assets/images/google.png";

const { Title, Text, Link } = Typography;

const SignUp = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { email, password } = values;
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      message.success("User, Register Succesfulyy");
      localStorage.setItem('user', email);  // Guardamos el usuario en localStorage
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <Title level={3}>Sign Up</Title>

        <Form name="signup" onFinish={onFinish} className="login-form">
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

          <Form.Item
            name="confirmPassword"
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
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          {/* <Form.Item>
            <Checkbox>Agree to Terms and Conditions</Checkbox>
          </Form.Item> */}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              size="large"
              block
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <Divider>Login</Divider>
        <Space>
            <Link href="/Login">Sign In</Link>
        </Space>
      </div>

      <Text type="secondary" className="login-footer">
        By signing up, you agree to our <Link href="/terms-and-conditions">Terms and Conditions</Link>.
      </Text>
    </div>
  );
    };

export default SignUp;