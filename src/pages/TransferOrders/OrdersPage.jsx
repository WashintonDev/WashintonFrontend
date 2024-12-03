import React,{useEffect, useState} from "react";
import Navbar from "../../components/Navbar"
import Modal from "../../components/Modal"
import Form from "../../components/Form"
import FormItem from "antd/es/form/FormItem";
import Table from "../../components/Table";
import {Select} from "antd";
import {fetchData,postData,fetchDataTesting} from "../../services/services"
import { API_URL_STORE_LABELS, API_URL_PRODUCT_LABELS, API_URL_TRANSPORT_ORDER, API_URL_TRANSPORT_ORDER_DETAIL, API_URL_TRANSPORT_ORDER_CANCEL } from "../../services/ApisConfig";
import { Flex, List, Typography, InputNumber, notification, Tag, Spin, Button, Input} from "antd";
import { CloseOutlined } from '@ant-design/icons';
import { DollarTwoTone, BarcodeOutlined, InfoCircleTwoTone} from '@ant-design/icons';
const { Title,Text } = Typography;



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
    const [isBarcode, setIsBarcode] = useState(false);
    const [totalOrderPrice , setTotalOrderPrice] = useState(0);
    const  [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [cancelText, setCancelText] = useState("");
    const [isModalCancellingVisible, setIsModalCancellingVisible] = useState(false);
    const [orderID, setOrderID] = useState("")


    //get the names, image, and sku of the products to search for them
    //get the names and ID of the stores

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
    
        try {
            const [stores, products, orders] = await Promise.all([
                fetchData(API_URL_STORE_LABELS),
                fetchData(API_URL_PRODUCT_LABELS),
                fetchData(API_URL_TRANSPORT_ORDER),
            ]);
    
            setStoreLabels(stores);
            const filteredProducts = products.filter(product => product.stock >= 10);
            setProductLabels(filteredProducts);
    
            const formattedOrders = orders.map(order => ({
                transfer_id: order.transfer_id,
                store: stores.find(store => store.value === order.store_id)?.label || "Unknown Store",
                transfer_date: formatDate(order.transfer_date),
                status: order.status,
                totalValue: order.totalValue,
                reasons: order.reasons,
                details: order.details.map(detail => ({
                    product: products.find(product => product.value === detail.product_id)?.label || "Unknown Product",
                    quantity: detail.quantity,
                    price: (detail.product.price) * (detail.quantity)
                })),
            }));
    
            // Define the custom order for statuses
            const statusOrder = ["Approving", "Preparing", "Delivering", "Delivered", "Cancelled", "Rejected"];
    
            // Sort the formattedOrders based on the custom order
            formattedOrders.sort((a, b) => {
                return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
            });
    
            setTransferOrders(formattedOrders);
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
        setTotalOrderPrice(0);
    };

    const handleCancelDetails = () => {
        setIsDetailModalVisible(false);
    };

    const handleCancelCacellation = () => {
        setIsCancelModalVisible(false);
    };

    const handleCancelQR = () => {
        setIsQRModalVisible(false);
    };

    const handleCancelCancellation = () => {
        setIsModalCancellingVisible(false);
    }

    const handleOkCancel = async () => {

        try {
            const values = await form.validateFields(); 
            const reason = values.reason; 
            
            if (!reason.trim()) {
                notification.warning({ message: "Please provide a reason for cancellation." });
                return;
            }
    
            await postData(API_URL_TRANSPORT_ORDER_CANCEL, {
                orderID: orderID,
                reasons: reason,
            });

            notification.success({ message: 'Cancelled order successfully.' });

        } catch (error) {
            notification.error({ message: "An error occurred while cancelling the order." });
            console.log(error)
        } finally {
            setIsModalCancellingVisible(false);
            setOrderID("")
            setTotalOrderPrice(0);
            await fetchAllData();
            form.resetFields();
        }
    };
    

    const updateTotalPrice = (products) => {
        let total = products.reduce((sum, product) => {
            const quantity = quantityMap[product.label] || 10; // Default quantity
            return sum + (product.price * quantity);
        }, 0);
        
        setTotalOrderPrice(total);
    };
    
    
    // Remove already selected products from the options
    const filteredProductLabels = productLabels
        .filter((product) => product.stock >= 10) // Only products with stock >= 10
        .filter((product) => !listOfProducts.some((item) => item.label === product.label)); // Exclude selected products
    
    // Selector
    const onChange = (_, option) => {
        setListOfProducts((prevList) => {
            const updatedList = [...prevList, option];
            updateTotalPrice(updatedList); // Recalculate total
            return updatedList;
        });
    
        setTransformedListOfProducts((prevList) => [...prevList, option.label]);
    };
    
    const onSearch = (value) => {
        console.log('search:', value);
    };
    
    const removeProductFromList = (itemToRemove) => {
        setTransformedListOfProducts((prevList) =>
            prevList.filter((item) => item !== itemToRemove)
        );
    
        setListOfProducts((prevList) => {
            const updatedList = prevList.filter((product) => product.label !== itemToRemove);
            updateTotalPrice(updatedList); // Recalculate total
            return updatedList;
        });
    };
    
    const handleQuantityChange = (label, value) => {
        const product = productLabels.find(item => item.label === label);
    
        if (product && value > product.stock) {
            notification.error({ message: `The maximum quantity for ${label} is ${product.stock}.` });
            return;
        }
    
        setQuantityMap((prevMap) => {
            const updatedMap = {
                ...prevMap,
                [label]: value,
            };
    
            // Recalculate the total
            const updatedTotalPrice = listOfProducts.reduce((total, product) => {
                const qty = updatedMap[product.label] || 10;
                return total + (product.price * qty);
            }, 0);
    
            setTotalOrderPrice(updatedTotalPrice);
    
            return updatedMap;
        });
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

            const response = await postData(API_URL_TRANSPORT_ORDER, {
                store_id: values.store_receiver,
                transfer_date: dateFormatter(),
                status: "Approving", //then a preparing order
            });
    
            const order_id = response.transfer_id;
            console.log(order_id)
    

            // Prepare the payload
            const labelQty = transformedListOfProducts.map((label) => ({
                product_id: productLabels.find(product => product.label === label).value,
                quantity: label_qty.find((item) => item.label === label).quantity
            }));

            console.log({
                transfer_id: order_id, 
                products: labelQty,
            });

            //end all products in a single request
            await postData(API_URL_TRANSPORT_ORDER_DETAIL, {
                transfer_id: order_id, 
                store_id: values.store_receiver,
                products: labelQty,
            });

            //error: Cannot read properties of undefined (reading 'transfer_id')
    
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
                if (text === 'Preparing') { 
                    color = 'orange'; 
                } else if (text === 'Delivering') {
                    color = 'yellow'; 
                } else if (text === 'Delivered'){ 
                    color = 'green'; 
                } else if (text === 'Approving'){ 
                    color = 'blue'; 
                } else {
                    color = 'red'
                }
                return <Tag color={color}>{text}</Tag>; 
            },
            showSorterTooltip: {
                target: 'full-header',
              },
              filters: [
                {
                    text: 'Approving',
                    value: 'Approving',
                  },
                {
                  text: 'Preparing',
                  value: 'Preparing',
                },
                {
                  text: 'Delivering',
                  value: 'Delivering',
                },
                {
                    text: 'Delivered',
                    value: 'Delivered',
                  },
                  {
                    text: 'Cancelled',
                    value: 'Cancelled',
                  },
                  {
                    text: 'Rejected',
                    value: 'Rejected',
                  },
              ],
              onFilter: (value, record) => record.status.indexOf(value) === 0,
              
        },
        {
            title: 'Worth',
            key: 'worth',
            dataIndex: 'totalValue',
            width: 50,
            align: 'center',
            render: (text) => { 
                return <Text><DollarTwoTone twoToneColor="#32CD32"/> {text}</Text>
            }
        },
        {
            title: 'Details',
            key: 'details',
            dataIndex: 'details',
            width: 80,
            align: 'center',
            render: (text, render) => (
                <Button onClick={() => {
                    setSelectedOrder(text); 
                    setIsDetailModalVisible(true); 
                    console.log(text)
                }}>
                    Expand
                </Button>
            )
        },
        {
            title: 'Codes',
            key: 'qr',
            width: 50,
            align: 'center',
            render: (record) => {
                if (record.status !== "Cancelled" && record.status !== "Rejected" && record.status != "Approving" && record.status != "Delivered") {
                    return (
                        <>
                            <Button onClick={() => {
                                setQRCodeText(record.transfer_id); 
                                setIsQRModalVisible(true);
                                setIsBarcode(true);
                            }}>
                                <BarcodeOutlined />
                            </Button>
                        </>
                    );
                }
                return null;
            }
        },        
        { 
            title: 'Cancelation', 
            key: 'reasons', 
            dataIndex: 'reasons', 
            width: 50, 
            align: 'center', 
            render: (text, record) => { 
                if (record.status === 'Preparing') { 
                    return ( <Button color="danger" variant="outlined" onClick={() => {setIsModalCancellingVisible(true);setOrderID(record.transfer_id)}}> Cancel </Button> ); 
                } else if (record.status === 'Cancelled'){
                    return (<Button onClick={() => {setIsCancelModalVisible(true); setCancelText(text)}}><InfoCircleTwoTone twoToneColor="#FF0000"/></Button>)
                }
                return null; 
            } 
        }
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
            align: 'center',
            render: (text) => {
                return <Text><DollarTwoTone twoToneColor='#32CD32'/> {text}</Text>
            }
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
                                    options={productLabels}
                                    />
                            </FormItem>
                            <Text type="danger">*You must select 10 different items to proceed with a transfer</Text>

                        </Form>

                        <Flex
                            vertical
                            align="center"
                            justify= "space-between"
                            >

                            <List
                                header={<Text strong >Different Products: {listOfProducts.length} | TOTAL$: {totalOrderPrice}</Text>}
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
                    pagination={5}
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
             <img
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${QRCodeText}&code=Code128&translate-esc=false`}
                            alt="Barcode"
                        />
              {/*  <QRCode value={QRCodeText} /> {/* Dummy text, add an order scramble ID */} 

            </div>

            </Modal>  
            <Modal
            visible={isCancelModalVisible}
            title = 'Reasons for the Canecellation'
            onCancel = {handleCancelCacellation}
            footer = {null}
            maxHeight = {400}
            >
             <Text>{cancelText}</Text>

            </Modal>

            <Modal 
                title="Cancel Order" 
                visible={isModalCancellingVisible} 
                onOk={handleOkCancel} 
                onCancel={handleCancelCancellation} 
            > 

                <Text>Please provide a reason for cancelling the order {orderID}:</Text> 
                <Form form={form}> 
                    <FormItem 
                        name="reason"  
                        rules={[{ required: true, message: 'Please provide a reason for cancellation' }]} 
                        > 
                        <Input placeholder="Enter the reason here..." /> 
                    </FormItem> 
                </Form> 
            </Modal>
        </div>
        </Spin>
    )
    }

export default OrdersPage;
