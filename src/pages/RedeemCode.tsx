import { useState, useEffect } from "react";
import {
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Switch,
  Table,
} from "antd";
import { getRedeemDataAPI } from "../api/redeemcode.js";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button.js";
import { Plus } from "lucide-react";
import CommonLabel from "../components/CommonLabel";
export default function ReedemCode() {
  const { Option } = Select;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const getUserData = async () => {
    try {
      setLoading(true);
      const res = await getRedeemDataAPI();

      const data = res?.data?.data || [];

      setUsers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

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
        return <div>{dayjs(data).format("YYYY-MM-DD HH:mm")}</div>;
      },
    },
  ];

  //redeem crud start her e
  const [editData, setEditData] = useState(false);
  const [form, setForm] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const openCreateDialog = () => {
    setEditData(false);
    setForm({});
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Redeem Code
            </h1>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Redeem Code
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </div>
      <Modal
        closable={false}
        maskClosable={false}
        title={
          <>
            <div className="text-xl font-bold">Add Redeem Code</div>
          </>
        }
        footer={false}
        open={dialogOpen}
        width={800}
        onCancel={() => setDialogOpen(false)}
      >
        <div className="   rounded-2xl ">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <CommonLabel label="Code" />
                <Input
                  placeholder="Code (SAVE50)"
                  value={form?.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                />
              </div>

              <div className="w-full">
                <CommonLabel label="Code Type" />

                <Select
                className="w-full"
                  value={form?.type}
                  onChange={(val) => handleChange("type", val)}
                >
                  <Option value="coins">Coins</Option>
                  <Option value="subscription">Subscription</Option>
                  <Option value="premium">Premium</Option>
                </Select>
              </div>
              <div>
                <CommonLabel label="Code Value" />

                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Value"
                  value={form?.value}
                  onChange={(val) => handleChange("value", val)}
                />
              </div>

              <div>
                <CommonLabel label="Expiry Date" />
                <DatePicker
                  value={form.expiryDate}
                  onChange={(date) => handleChange("expiryDate", date)}
                />
              </div>
              <div>
                <CommonLabel label="Max Uses" />

                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="Max Uses"
                  value={form.maxUses}
                  onChange={(val) => handleChange("maxUses", val)}
                />
              </div>
 <div>
                <CommonLabel label="Used Count" />

                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="Max Uses"
                  value={form?.usedCount}
                  onChange={(val) => handleChange("maxUses", val)}
                />
              </div>
              {/* <div>
               
                  <span>Active</span>
                  <Switch
                    checked={form.isActive}
                    onChange={(val) => handleChange("isActive", val)}
                  />
                
              </div> */}
            </div>
             <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setForm({});
                setEditData(false);
                setDialogOpen(false);
              }}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
            {/* <Button onClick={()=>addBannerAPIData()}>Submit</Button> */}

            <Button>
              {loading ? (
                <Spin />
              ) : (
                <> Submit</>
              )}
            </Button>
          </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
