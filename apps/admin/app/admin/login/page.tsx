"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: { password: string }) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: values.password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          CMS Admin
        </Typography.Title>
        <Typography.Text type="secondary">Sign in to manage your site</Typography.Text>

        <Form layout="vertical" onFinish={handleSubmit} style={{ marginTop: 24 }}>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter admin password" />
          </Form.Item>

          {error ? <Alert type="error" message={error} style={{ marginBottom: 16 }} /> : null}

          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign in
          </Button>
        </Form>

        <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0, fontSize: 12 }}>
          Default password is set in <code>ADMIN_PASSWORD</code> env variable.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
