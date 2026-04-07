import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Table } from "antd";
import { getUserDataAPI } from "../api/user.js";
import dayjs from "dayjs";

export default function Users() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const getUserData = async () => {
    try {
      setLoading(true);
      const res = await getUserDataAPI({ page, limit });

      const data = res?.data?.data || [];
      const totalCount = res?.data?.total || 0;

      setUsers(data);
      setTotal(totalCount);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, [page, limit]);

  // Table columns
  const columns = [
    {
      title: "Mobile Number",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
     render: (data) => {
  return (
    <div>{dayjs(data).format("YYYY-MM-DD HH:mm")}</div>
  );
}
     
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Users
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your platform users
          </p>
        </div>
       
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
        }}
        onChange={(pagination) => {
          setPage(pagination.current);
          setLimit(pagination.pageSize);
        }}
      />
    </div>
  );
}