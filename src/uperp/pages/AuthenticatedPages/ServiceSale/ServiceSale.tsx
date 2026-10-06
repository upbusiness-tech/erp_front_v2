import { CashFlowStatus } from "@/application-components/CashFlowStatus/CashFlowStatus";
import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { OrderContent } from "@/application-components/OrderContent/OrderContent";
import { ProductEspecificationModal } from "@/application-components/ProductEspecificationModal/ProductEspecificationModal";
import { RecentSalesModal } from "@/application-components/RecentSalesModal/RecentSalesModal";
import { SaleReceiptModal } from "@/application-components/SaleReceiptModal/SaleReceiptModal";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { useSalesStore } from "@/stores/sales.store";
import { Badge, Button, Card, Col, Drawer, Form, Grid, Input, Row, Space, Typography } from "antd";
import { Briefcase, History, Package, Plus, ShoppingCart } from "lucide-react";
import type { ISaleServiceForm } from "../CommonSale/types";
import { useServiceSaleController } from "./useServiceSale.controller";
import { SaleType } from "@/enums/sale.enum";

const { Text } = Typography;

const { useBreakpoint } = Grid;

export const ServiceSale = () => {
  const {
    search,
    handleSearchChange,
    products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    tableColumns,
    handleOpenProductModal,
    handleCloseProductModal,
    openProductModal,
    selectedProduct,
    saleForm,
    saleItems,
    saleStep,
    cartOpen,
    setCartOpen,
    handleSubmitSale,
    submiting,
    receiptSale,
    handleCloseReceipt,
    receiptVariant,
    recentOpen,
    setRecentOpen,
    recentSales,
    recentSalesTotal,
    recentSalesLoading,
    recentSalesPage,
    recentSalesPageSize,
    handleRecentSalesPageChange,
    handleRecentSalesPageSizeChange,
    handleViewRecentSale,
    resetSale,
  } = useServiceSaleController();

  const { selectedCustomer, addSaleService } = useSalesStore();
  const [serviceForm] = Form.useForm<ISaleServiceForm>();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const cartCount = saleItems.reduce((s, i) => s + i.quantitySold, 0);

  const handleAddService = (values: ISaleServiceForm) => {
    addSaleService({
      description: values.description.trim(),
      onwerEmployee: values.onwerEmployee.trim(),
      amount: values.amount,
    });
    serviceForm.resetFields();
  };

  return (
    <>
      <Row gutter={16} style={{ minHeight: "calc(100vh - 112px)" }} align="stretch">
        <Col xs={24} lg={16} style={{ display: "flex", flexDirection: "column" }}>
          {!isMobile ? (
            <CashFlowStatus onShowRecentSales={() => setRecentOpen(true)} />
          ) : (
            <Button
              style={{ marginBottom: "5px" }}
              icon={<History size={14} />}
              onClick={() => setRecentOpen(true)}
            >
              Ver vendas recentes
            </Button>
          )}

          <Card
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1, display: "flex", flexDirection: "column" } }}
            title={
              <Space>
                <Briefcase size={18} /> Serviços prestados
              </Space>
            }
          >
            <Form
              form={serviceForm}
              layout="vertical"
              onFinish={handleAddService}
              initialValues={{ amount: 0 }}
              requiredMark={false}
              size="middle"
            >
              <Row gutter={12} style={{ marginBottom: 0 }}>
                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label="Descrição"
                    rules={[
                      { required: true, message: "Informe a descrição" },
                      {
                        validator: (_, v) =>
                          v && v.trim().length > 0
                            ? Promise.resolve()
                            : Promise.reject("Descrição obrigatória"),
                      },
                    ]}
                    style={{ marginBottom: 8 }}
                  >
                    <Input placeholder="Descrição do serviço" allowClear />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="onwerEmployee"
                    label="Funcionário"
                    rules={[
                      { required: true, message: "Informe o funcionário" },
                      {
                        validator: (_, v) =>
                          v && v.trim().length > 0
                            ? Promise.resolve()
                            : Promise.reject("Funcionário obrigatório"),
                      },
                    ]}
                    style={{ marginBottom: 8 }}
                  >
                    <Input placeholder="Responsável" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="amount"
                    label="Valor"
                    rules={[
                      { required: true, message: "Informe o valor" },
                      {
                        validator: (_, v) =>
                          typeof v === "number" && v > 0
                            ? Promise.resolve()
                            : Promise.reject("Valor deve ser maior que zero"),
                      },
                    ]}
                    style={{ marginBottom: 8 }}
                  >
                    <InputNumberFormatted prefix="R$" placeholder="0,00" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Plus size={16} />}
                  block={isMobile}
                  style={{ background: "#F26B1F", borderColor: "#F26B1F" }}
                >
                  Adicionar serviço
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1, display: "flex", flexDirection: "column" } }}
            title={
              <Space>
                <Package size={18} /> Produtos do Estoque
              </Space>
            }
          >
            <Row gutter={12} style={{ marginBottom: 16 }} align="top">
              <SearchBar
                searches={[
                  {
                    name: "name",
                    value: search,
                    onChange: handleSearchChange,
                    placeholder: "Buscar por produto",
                    size: "middle",
                  },
                ]}
              />
            </Row>

            <GenericTable
              rowKey="id"
              columns={tableColumns}
              data={products}
              total={total}
              size="small"
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onRowClick={handleOpenProductModal}
              showTotal={false}
            />
          </Card>
        </Col>

        {!isMobile && (
          <Col xs={0} lg={8} style={{ display: "flex", flexDirection: "column" }}>
            <Card
              title={
                <Space>
                  <ShoppingCart size={18} /> Comanda
                </Space>
              }
              extra={
                saleItems.length > 0 &&
                saleStep === "items" && (
                  <Button size="small" type="link" onClick={resetSale}>
                    Limpar
                  </Button>
                )
              }
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, overflowY: "auto" } }}
            >
              <OrderContent
                submitingSale={submiting}
                handleSubmitSale={handleSubmitSale}
                saleType={SaleType.SERVICE}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* carrinho de itens no mobile */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 1000,
          }}
        >
          <Badge count={cartCount} offset={[-6, 6]} color="#DC2626">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<ShoppingCart size={22} />}
              onClick={() => setCartOpen(true)}
              style={{
                width: 60,
                height: 60,
                boxShadow: "0 6px 20px rgba(242, 107, 31, 0.45)",
              }}
            />
          </Badge>
        </div>
      )}

      {/* comanda no modo responsivo */}
      <Drawer
        title={
          <Space>
            <ShoppingCart size={18} /> Comanda
            {saleItems.length > 0 && saleStep === "items" && (
              <Button size="small" type="link" onClick={resetSale}>
                Limpar
              </Button>
            )}
          </Space>
        }
        placement="right"
        open={cartOpen && isMobile}
        onClose={() => setCartOpen(false)}
        width={Math.min(420, typeof window !== "undefined" ? window.innerWidth - 24 : 360)}
      >
        <OrderContent
          submitingSale={submiting}
          handleSubmitSale={handleSubmitSale}
          saleType={SaleType.SERVICE}
        />
      </Drawer>

      {/* modal de vendas recentes */}
      <RecentSalesModal
        open={recentOpen}
        onClose={() => setRecentOpen(false)}
        handleViewRecentSale={handleViewRecentSale}
        data={recentSales}
        isLoading={recentSalesLoading}
        total={recentSalesTotal}
        page={recentSalesPage}
        pageSize={recentSalesPageSize}
        onPageChange={handleRecentSalesPageChange}
        onPageSizeChange={handleRecentSalesPageSizeChange}
        onRowClick={handleViewRecentSale}
      />

      {/* modal para escolher variação do produto */}
      <ProductEspecificationModal
        openProductEspecificationModal={openProductModal}
        onClose={handleCloseProductModal}
        product={selectedProduct}
        form={saleForm}
        selectedCustomer={selectedCustomer}
      />

      {/* modal de recibo de venda */}
      <SaleReceiptModal
        receiptSale={receiptSale}
        onClose={handleCloseReceipt}
        variant={receiptVariant}
      />
    </>
  );
};
