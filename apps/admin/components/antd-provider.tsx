"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#1677ff",
            borderRadius: 6,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
