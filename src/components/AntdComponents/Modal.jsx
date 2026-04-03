import React from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const CommonDeleteModal = ({
  open,
  onCancel,
  onConfirm,
  title = "Are you sure you want to delete this data?",
  description = "This action cannot be undone.",
  loading = false,
}) => {
  return (
    <Modal open={open} footer={null} onCancel={onCancel} centered>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        
        {/* Icon */}
        <ExclamationCircleOutlined
          style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
        />

        {/* Title */}
        <h3>{title}</h3>

        {/* Description */}
        <p>{description}</p>

        {/* Buttons */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Button onClick={onCancel}>
            Cancel
          </Button>

          <Button
            danger
            type="primary"
            loading={loading}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CommonDeleteModal;