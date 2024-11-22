import React,{useEffect, useState} from "react";
import Navbar from "../../components/Navbar"
import Modal from "../../components/Modal"
import Form from "../../components/Form"
import FormItem from "antd/es/form/FormItem";
import Table from "../../components/Table";
import Button from "../../components/Button"
import {Select} from "antd";
import {fetchDataTesting} from "../../services/services"
import { API_URL_STORE_LABELS, API_URL_PRODUCT_LABELS, API_URL_TRANSPORT_ORDER, API_URL_TRANSPORT_ORDER_DETAIL } from "../../services/ApisConfig";
import { Flex, List, Typography, InputNumber, notification, Tag, Spin, QRCode} from "antd";
import { CloseOutlined } from '@ant-design/icons';
import { RestTwoTone, QrcodeOutlined } from '@ant-design/icons';
import axios from "axios";
const { Title } = Typography;



const OrdersPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [storeLabes, setStoreLabels] = useState([]);
    const [productLabels, setProductLabels] = useState([]);
    const [transformedListOfProducts, setTransformedListOfProducts] = useState([]);
    const [listOfProducts, setListOfProducts] = useState([]);
    const [quantityMap, setQuantityMap] = useState({});
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [transferOrders, setTransferOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isQRModalVisible, setIsQRModalVisible] = useState(false);
    const [QRCodeText, setQRCodeText] = useState('');

    //get the names, image, and sku of the products to search for them
    //get the names and ID of the stores

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
    
        try {
            const [stores, products, orders] = await Promise.all([
                fetchDataTesting(API_URL_STORE_LABELS),
                fetchDataTesting(API_URL_PRODUCT_LABELS),
                fetchDataTesting(API_URL_TRANSPORT_ORDER),
            ]);
    
            setStoreLabels(stores);
            setProductLabels(products);
    
            const formattedOrders = orders.map(order => ({
                transfer_id: order.transfer_id,
                store: stores.find(store => store.value === order.store_id)?.label || "Unknown Store",
                transfer_date: formatDate(order.transfer_date),
                status: order.status,
                details: order.details.map(detail => ({
                    product: products.find(product => product.value === detail.product_id)?.label || "Unknown Product",
                    quantity: detail.quantity,
                    price: detail.product.price
                })),
            }));
    
            setTransferOrders(formattedOrders);
            console.log(orders)
        } catch (error) {
            notification.error({ message: 'Error fetching data' });
        } finally {
            setLoading(false);
        }
    };
    

    function formatDate(dateString) { 
        const options = { year: 'numeric', month: 'long', day: 'numeric' }; 
        const date = new Date(dateString); 
        return date.toLocaleDateString(undefined, options); 
    }

    //This is to show the modal
    const handleAdd = () => {
        setIsModalVisible(true)
    }
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setListOfProducts([]);
        setTransformedListOfProducts([]);
    };

    const handleCancelDetails = () => {
        setIsDetailModalVisible(false);
    };

    const handleCancelQR = () => {
        setIsQRModalVisible(false);
    };

    //selector
    const onChange = (_, option) => {
        setListOfProducts(prevList => [...prevList, option]);
        setTransformedListOfProducts(prevList => [...prevList, option.label]);
    };

    const onSearch = (value) => {
        console.log('search:', value);
    };

    const removeProductFromList = (itemToRemove) => {
        //this is going to remove it from the label list, but i still need to remove it from the actual list with JSONs
        setTransformedListOfProducts(prevList => prevList.filter(item => item !== itemToRemove));
        setListOfProducts(prevList => {
            const index = prevList.findIndex(item => item.label === itemToRemove);
            if (index === -1) return prevList; // if label is not found, no changes are going to be done
            return [...prevList.slice(0, index), ...prevList.slice(index + 1)];
          });
    }

    const handleQuantityChange = (label, value) => {
        const product = productLabels.find(item => item.label === label);
    
        if (product && value > product.stock) {
            notification.error({ message: `The maximum quantity for ${label} is ${product.stock}.` });
            return;
        }
    
        setQuantityMap(prevMap => ({
            ...prevMap,
            [label]: value
        }));
    };
    

    const dateFormatter = () => {
        const currentDate = new Date(); 
        const year = currentDate.getFullYear(); 
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based 
        const day = String(currentDate.getDate()).padStart(2, '0'); 
        return (`${year}-${month}-${day}`);
    }

    const submitOrder = async () => {
        try {
            const values = await form.validateFields();
    
            // Check if there's an active order for the selected store
            const activeOrder = transferOrders.find(
                (order) => 
                    order.store === storeLabes.find(store => store.value === values.store_receiver)?.label &&
                    order.status !== "Delivered" // Adjust based on your 'completed' status
            );
    
            if (activeOrder) {
                notification.error({ message: `Store ${activeOrder.store} already has an active order.` });
                return;
            }
    
            if (transformedListOfProducts.length < 10) {
                notification.error({ message: 'You must select at least 10 products to proceed.' });
                return;
            }

            // i need to check here if all the products actually have stock
            const label_qty = transformedListOfProducts.map((item) => ({
                label: item,
                quantity: quantityMap[item] || 10,
            }));

            for (const label of transformedListOfProducts){
                const product = productLabels.find(product => product.label === label);
                const quantityData = label_qty.find((item) => item.label === label);

                if (quantityData.quantity > product.stock){
                    notification.error({ message: `${label} has not enough stock to order ${quantityData.quantity}, ${product.stock} available` });
                    return;
                }
            }
    
            setConfirmLoading(true);
            const response = await axios.post(API_URL_TRANSPORT_ORDER, {
                store_id: values.store_receiver,
                transfer_date: dateFormatter(),
                status: "Pending",
            });
    
            const order_id = response.data.transfer_id;
    

            //improve this to make 1 post instead of individual posting
    
            for (const label of transformedListOfProducts) {
                const product = listOfProducts.find((item) => item.label === label);
                const quantityData = label_qty.find((item) => item.label === label);
    
                await axios.post(API_URL_TRANSPORT_ORDER_DETAIL, {
                    transfer_id: order_id,
                    product_id: product ? product.value : null,
                    quantity: quantityData ? quantityData.quantity : null,
                });
            }
    
            notification.success({ message: 'Order and details submitted successfully' });
            setConfirmLoading(false);
            handleCancel();
            await fetchAllData();
        } catch (error) {
            notification.error({ message: error.message || 'Error submitting order' });
        }
    };
    
    

    const columns = [
        {
            title: 'Transfer ID',
            key: 'transfer_id',
            dataIndex: 'transfer_id',
            width: 80,
            align: 'center',
        },
        {
            title: 'Store',
            key: 'store',
            dataIndex: 'store',
            width: 80,
            align: 'center',
        },
        {
            title: 'Date',
            key: 'transfer_date',
            dataIndex: 'transfer_date',
            width: 80,
            align: 'center',
        },
        { 
            title: 'Status', 
            key: 'status', 
            dataIndex: 'status', 
            width: 80, 
            align: 'center', 
            render: (text) => { 
                let color; 
                if (text === 'Pending') { 
                    color = 'red'; 
                } else if (text === 'Delivering') {
                     color = 'yellow'; 
                    } else { color = 'green'; } return <Tag color={color}>{text}</Tag>; }},
        {
            title: 'Details',
            key: 'details',
            dataIndex: 'details',
            width: 80,
            align: 'center',
            render: (text,render) => (<Button onClick={() => {setSelectedOrder(text); setIsDetailModalVisible(true); console.log(text)}}>Expand</Button>)
        },
        {
            title: 'QR Code',
            key: 'qr',
            width: 50,
            align: 'center',
            render: (record) => (<Button onClick={() => {setQRCodeText(record.transfer_id); setIsQRModalVisible(true)}}><QrcodeOutlined /></Button> )
        },
    ];

    const productColumns = [
        {
            title: 'Product',
            key: 'product',
            dataIndex: 'product',
            width: 50,
            align: 'center',
        },
        {
            title: 'Quantity',
            key: 'qty',
            dataIndex: 'quantity',
            width: 50,
            align: 'center'
        },
        {
            title: 'Price',
            key: 'price',
            dataIndex: 'price',
            width: 50,
            align: 'center'
        }
    ];
    

    return (
        <Spin spinning={loading} tip="Loading...">
        <div>
            <Navbar
            title = "Transfer Orders"
            onAddCategory={handleAdd}
            showSearch = {false}
            />

            <div style={{padding: 30}}>
            {/* Table of the receipts */}
            <Table
            columns={columns}
            dataSource={transferOrders}
            style = {{padding: 20}}
            />
            </div>

            <Modal 
                visible={isModalVisible}
                title = 'Create a Transfer Order'
                onCancel = {handleCancel}
                onOk = {submitOrder}
                confirmLoading={confirmLoading}
                width = {700}
                marginRight= {400}
                okText="Order"
                >

                    <Flex justify="center">
                        <Form form={form} layout = 'vertical' style={{ width: '250px', marginRight: '45px'}}>
                            <FormItem name='store_receiver' label='Deliver to' rules={[{ required: true, message: 'Please select a store to deliver to!' }]}  >
                                <Select 
                                    showSearch
                                    placeholder='Select a Store' 
                                    optionFilterProp='label'
                                    onSearch={onSearch}                                                         
                                    options={storeLabes}
                                   /> {/* it should be a selector of all the stores avaliable */}
                                    
                            </FormItem>

                            <FormItem name='search_products' label='Add products' rules={[{ required: true, message: 'Select a minimum of 10 products' }]}>
                            <Select 
                                    showSearch
                                    placeholder='Select a Store' 
                                    optionFilterProp='label'
                                    onChange={onChange}
                                    onSearch={onSearch}
                                    options={productLabels}/>
                            </FormItem>
                        </Form>

                        <Flex
                            vertical
                            align="center"
                            justify= "space-between"
                            >

                            <List
                                header={<Title level={5}>Selected Products</Title>}
                                bordered
                                dataSource={transformedListOfProducts}
                                style={{
                                    width: 350,
                                    maxHeight: 400,  
                                    overflowY: "auto"  
                                }}
                                renderItem={(item) => {
                                    const product = productLabels.find(product => product.label === item);
                                    const currentQty = quantityMap[item] || 10;
                                    const isOverstock = product && currentQty > product.stock;
                                    
                                    return (
                                        <List.Item>
                                            <CloseOutlined 
                                                onClick={() => {removeProductFromList(item)}} 
                                                style={{ marginRight: 8, cursor: 'pointer', color: 'red' }} 
                                            /> 
                                            {item} 
                                            <InputNumber 
                                                min={10} 
                                                defaultValue={currentQty} 
                                                style={{ 
                                                    width: 70, 
                                                    marginLeft: 10, 
                                                    borderColor: isOverstock ? 'red' : 'initial'
                                                }} 
                                                onChange={(value) => handleQuantityChange(item, value)}
                                            />
                                        </List.Item>
                                    );
                                }}
                            />

                                
                        </Flex>
                    </Flex>

            </Modal>    
            <Modal
            visible={isDetailModalVisible}
            title = 'Order Details'
            onCancel = {handleCancelDetails}
            footer = {null}
            maxHeight = {400}
            >
                    <Table
                    columns={productColumns}
                    dataSource={selectedOrder}
                    style = {{padding: 20}}
                    pagination={{ pageSize: 5 }}
                    />

            </Modal>   
            
            <Modal
            visible={isQRModalVisible}
            title = 'Scan the Code to Confirm Order'
            onCancel = {handleCancelQR}
            footer = {null}
            maxHeight = {400}
            >
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}> 
                <QRCode value={QRCodeText} /> {/* Dummy text, add an order scramble ID */} 
            </div>

            </Modal>  
        </div>
        </Spin>
    )
    }

export default OrdersPage;
