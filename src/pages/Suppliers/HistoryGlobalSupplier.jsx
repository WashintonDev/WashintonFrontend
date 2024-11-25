import { Image, Table, Tag, notification } from "antd";
import useSupplierGlobalHistory from "../../hooks/UseSupplierGlobalHistory";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import TableSkeleton from "../../components/CardSkeleton/CardSkeleton";
import SearchBar from "./SearchGlobalHistory";

const HistorySupplier = () => {
  const { filteredData, loading, error } = useSupplierGlobalHistory();
  const [filteredDataState, setFilteredDataState] = useState(filteredData);

  const handleSearch = (query) => {
    const filtered = filteredData.filter(
      (item) =>
        item.brand.toLowerCase().includes(query.toLowerCase()) ||
        item.product_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDataState(filtered);
  };

  const columns = [
    {
      title: "Supplier",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_id",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      ellipsis: true,
      render: (text) =>
        text != "active" ? (
          <Tag color="red">{text}</Tag>
        ) : (
          <Tag color="green">{text}</Tag>
        ),
      width: 130,
    },
    {
      title: "Product Image",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <Image
          width={50}
          height={50}
          src={text}
          preview={{
            src: text,
            title: text,
          }}
          style={{
            cursor: "pointer",
            objectFit: "contain",
            borderRadius: "5px",
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    setFilteredDataState(filteredData);
  }, [filteredData]);

  return (
    <div>
      {
        error && notification.error({
          message: error || "Error fetching supplier data",
        })
      }
      <Navbar
        title="Supplier Global History"
        showSearch={false}
        showAdd={false}
      />
      <div style={{ maxWidth: "80%", margin: "0 auto", marginBottom: "20px" }}>
        <SearchBar onSearch={handleSearch} />
        {loading ? (
          <TableSkeleton />
        ) : (
          <Table
            dataSource={filteredDataState}
            columns={columns}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            loading={loading}
            style={{ maxWidth: "80%", margin: "0 auto" }}
          />
        )}
      </div>
    </div>
  );
};

export default HistorySupplier;
