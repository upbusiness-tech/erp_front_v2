import { Button, Col, Modal, Pagination, Result, Row, Skeleton, Typography } from "antd";
import { Check, ImageOff, Images } from "lucide-react";
import { useState } from "react";
import { BRAND, BRAND_SOFT_ALT } from "@/theme/colors";
import { useProductGalleryModalController } from "./useProductGalleryModalController";

const { Text, Title } = Typography;

type ProductGalleryModalProps = {
  open: boolean;
  currentPicture?: string;
  onClose: () => void;
  onSelect: (url: string) => void;
  onRequestUpload?: () => void;
};

const tileStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1",
  padding: 0,
  border: "2px solid transparent",
  borderRadius: 8,
  overflow: "hidden",
  background: "#fafafa",
  cursor: "pointer",
  display: "block",
  transition: "border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: BRAND,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
};

const fallbackStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fafafa",
  color: "#bbb",
};

type ThumbnailProps = {
  src: string;
  isCurrent: boolean;
  onSelect: () => void;
};

function Thumbnail({ src, isCurrent, onSelect }: ThumbnailProps) {
  const [broken, setBroken] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);

  const active = hover || focused;

  const resolvedStyle: React.CSSProperties = {
    ...tileStyle,
    borderColor: active || isCurrent ? BRAND : "transparent",
    boxShadow: active
      ? "0 6px 14px rgba(242, 107, 31, 0.18)"
      : isCurrent
        ? "0 0 0 1px rgba(242, 107, 31, 0.3)"
        : "none",
    transform: active ? "translateY(-1px)" : "none",
    outline: focused ? `2px solid ${BRAND}` : "none",
    outlineOffset: 2,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label="Usar esta foto"
      aria-pressed={isCurrent}
      style={resolvedStyle}
    >
      {broken ? (
        <div style={fallbackStyle}>
          <ImageOff size={22} />
        </div>
      ) : (
        <img src={src} alt="" style={imgStyle} onError={() => setBroken(true)} />
      )}
      {isCurrent && (
        <span style={badgeStyle} aria-label="Foto em uso neste produto">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export function ProductGalleryModal({
  open,
  currentPicture,
  onClose,
  onSelect,
  onRequestUpload,
}: ProductGalleryModalProps) {
  const { items, isLoading, isError, refetch, page, total, pageCount, limit, handlePageChange } =
    useProductGalleryModalController({ open });

  const showPagination = !isLoading && !isError && total > limit && pageCount > 1;

  const titleNode = (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <Images size={18} style={{ color: BRAND, flexShrink: 0, marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <Title level={4} style={{ margin: 0 }}>
          Galeria de fotos
        </Title>
        <Text type="secondary" style={{ display: "block", marginTop: 2 }}>
          {isLoading || isError
            ? "Escolha uma foto já usada para aplicar a este produto."
            : `Escolha uma foto já usada para aplicar a este produto. · ${total} fotos`}
        </Text>
      </div>
    </div>
  );

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  const handleRequestUpload = () => {
    onRequestUpload?.();
    onClose();
  };

  let body: React.ReactNode;

  if (isLoading) {
    body = (
      <Row gutter={[12, 12]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Col xs={12} sm={8} md={6} key={i}>
            <Skeleton.Node
              active
              style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 8 }}
            />
          </Col>
        ))}
      </Row>
    );
  } else if (isError) {
    body = (
      <Result
        status="error"
        title="Não foi possível carregar a galeria."
        subTitle="Verifique sua conexão e tente novamente."
        extra={
          <Button type="primary" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        }
        style={{ padding: "24px 0" }}
      />
    );
  } else if (items.length === 0) {
    body = (
      <div
        style={{
          textAlign: "center",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: BRAND_SOFT_ALT,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <ImageOff size={26} style={{ color: BRAND }} />
        </div>
        <Title level={5} style={{ marginBottom: 4 }}>
          Nenhuma foto na galeria ainda
        </Title>
        <Text
          type="secondary"
          style={{ display: "block", marginBottom: 16, maxWidth: 360, margin: "0 auto 16px" }}
        >
          As fotos enviadas nos produtos aparecem aqui para reutilização rápida.
        </Text>
        {onRequestUpload && (
          <Button type="primary" onClick={handleRequestUpload}>
            Enviar foto
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <Row gutter={[12, 12]}>
          {items.map((item) => (
            <Col xs={12} sm={8} md={6} key={item.productPicture}>
              <Thumbnail
                src={item.productPicture}
                isCurrent={item.productPicture === currentPicture}
                onSelect={() => handleSelect(item.productPicture)}
              />
            </Col>
          ))}
        </Row>
        {showPagination && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 16,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Página {page} de {pageCount}
            </Text>
            <Pagination
              current={page}
              total={total}
              pageSize={limit}
              onChange={handlePageChange}
              showSizeChanger={false}
              size="small"
            />
          </div>
        )}
      </>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnHidden
      title={titleNode}
      styles={{
        body: {
          padding: "12px 24px 16px",
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
        },
      }}
    >
      {body}
    </Modal>
  );
}
