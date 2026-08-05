import { CashFlowStatus } from "@/application-components/CashFlowStatus/CashFlowStatus";
import { OrderContent } from "@/application-components/OrderContent/OrderContent";
import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { ProductCard } from "@/application-components/ProductCard/ProductCard";
import { ProductEspecificationModal } from "@/application-components/ProductEspecificationModal/ProductEspecificationModal";
import { SaleReceiptModal } from "@/application-components/SaleReceiptModal/SaleReceiptModal";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import { EProductView, useSalesStore } from "@/stores/sales.store";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Grid,
  Pagination,
  Row,
  Segmented,
  Space,
} from "antd";
import { ShoppingCart } from "lucide-react";
import { useCommonSaleController } from "./useCommonSale.controller";

const { useBreakpoint } = Grid;

export function CommonSale() {
  const {
    handleSearchChange,
    search,
    productsView,
    setProductsView,
    products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    tableColumns,
    handleCloseProductModal,
    handleOpenProductModal,
    openProductModal,
    selectedProduct,
    saleForm,
    saleStep,
    saleItems,
    cartOpen,
    setCartOpen,
    handleSubmitSale,
    receiptSale,
    handleCloseReceipt,
    resetSale,
  } = useCommonSaleController();

  const { selectedCustomer } = useSalesStore();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const cartCount = saleItems.reduce((s, i) => s + i.quantitySold, 0);

  return (
    <>
      <Row gutter={16} style={{ minHeight: "calc(100vh - 112px)" }} align="stretch">
        <Col xs={24} lg={16} style={{ display: "flex", flexDirection: "column" }}>
          <CashFlowStatus />

          <Card
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1, display: "flex", flexDirection: "column" } }}
          >
            <Row gutter={12} style={{ marginBottom: 16 }} align="top">
              <Col flex="auto">
                <SearchBar
                  searches={[
                    {
                      name: "name",
                      value: search,
                      onChange: handleSearchChange,
                      placeholder: "Buscar por produto",
                      size: "large",
                    },
                  ]}
                />
              </Col>
              <Col>
                <Segmented
                  size="medium"
                  value={productsView}
                  onChange={(v) => setProductsView(v)}
                  options={[
                    { value: EProductView.CARDS, icon: <AppstoreOutlined /> },
                    { value: EProductView.LIST, icon: <BarsOutlined /> },
                  ]}
                />
              </Col>
            </Row>

            {productsView === EProductView.CARDS ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1 }}>
                  <Row gutter={[12, 12]}>
                    {products.map((p) => (
                      <Col key={p.id} xs={12} sm={8} md={6}>
                        <ProductCard onClickProduct={() => handleOpenProductModal(p)} product={p} />
                      </Col>
                    ))}
                    {products.length === 0 && <Empty style={{ width: "100%", padding: 32 }} />}
                  </Row>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger
                    pageSizeOptions={[8, 12, 16, 24]}
                    onChange={handlePageChange}
                    onShowSizeChange={(_, size) => handlePageSizeChange(size)}
                  />
                </div>
              </div>
            ) : (
              <GenericTable
                rowKey="id"
                columns={tableColumns}
                data={products}
                total={total}
                isLoading={isLoading}
                page={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onRowClick={handleOpenProductModal}
              />
            )}
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
              <OrderContent handleSubmitSale={handleSubmitSale} />
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
        <OrderContent handleSubmitSale={handleSubmitSale} />
      </Drawer>

      {/* modal de vendas recentes */}

      {/* modal para escolher variação do produto */}
      <ProductEspecificationModal
        openProductEspecificationModal={openProductModal}
        onClose={handleCloseProductModal}
        product={selectedProduct}
        form={saleForm}
        selectedCustomer={selectedCustomer}
      />

      {/* modal de recibo de venda */}
      <SaleReceiptModal receiptSale={receiptSale} onClose={handleCloseReceipt} />
    </>
  );
}
