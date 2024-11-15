import React,{useEffect, useState} from "react";
import Navbar from "../../components/Navbar"
import Modal from "../../components/Modal"
import Form from "../../components/Form"
import FormItem from "antd/es/form/FormItem";
import Input from "../../components/Input"
import {Select} from "antd";
import {fetchDataTesting} from "../../services/services"
import { API_URL_STORE_LABELS } from "../../services/ApisConfig";
import { Flex, List, Divider } from "antd";
import Button from "../../components/Button"


const OrdersPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [storeLabes, setStoreLabels] = useState([]);

    //get the names, image, and sku of the products to search for them
    //get the names and ID of the stores

    useEffect(() => {
        fetchStoreLabels();
    }, []);

    //fetch the stores
    const fetchStoreLabels = async() => {
        console.log(setStoreLabels(await fetchDataTesting(API_URL_STORE_LABELS)));    
            
    }

    //This is to show the modal
    const handleAdd = () => {
        setIsModalVisible(true)
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    //selector
    const onChange = (value) => {
        console.log(`selected ${value}`);
    };

    const onSearch = (value) => {
        console.log('search:', value);
    };


    return (
        <div>
            <Navbar
            title = "Transfer Orders"
            onAddCategory={handleAdd}
            />

            {/* Table of the receipts */}
            <Modal 
                visible={isModalVisible}
                title = 'Create a Transfer Order'
                onCancel = {handleCancel}>

                    <Flex justify="space-between">

                        <Form form={form} layout = 'vertical'>
                            <FormItem name='store_receiver' label='Deliver to' rules={[{ required: true, message: 'Please select a store to deliver to!' }]}>
                                <Select 
                                    showSearch
                                    placeholder='Select a Store' 
                                    optionFilterProp='label'
                                    onChange={onChange}
                                    onSearch={onSearch}
                                    options={storeLabes}/> {/* it should be a selector of all the stores avaliable */}
                            </FormItem>

                            <FormItem name='search_products' label='Add products' rules={[{ required: true, message: 'Select a minimum of 10 products' }]}>
                            <Select 
                                    showSearch
                                    placeholder='Select a Store' 
                                    optionFilterProp='label'
                                    onChange={onChange}
                                    onSearch={onSearch}
                                    options={storeLabes}/>
                            </FormItem>
                        </Form>

                        <Flex
                            vertical
                            align="center"
                            justify= "space-between"
                            // style={{marginRight: 100}}
                            >

                            <List
                            header={<div>Selected Products</div>}
                            bordered
                            style={{width: 300}}
                            />
                                
                                {/* renderItem={(item) => (
                                    <List.Item>
                                    <Typography.Text mark>[ITEM]</Typography.Text> {item}
                                    </List.Item>
                                )} */}
                        </Flex>
                    </Flex>

            </Modal>        
        </div>
    )
    }

export default OrdersPage;
