import { InvoiceStatus } from "@/enums/invoice.enum";
import { useCacheManager } from "@/hooks/useCacheManager";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { InvoiceModel } from "@/model/invoice.model";
import { InvoiceService } from "@/services/invoice.service";
import { Modal, Typography, Upload, message } from "antd";
import { Camera } from "lucide-react";
import { useState } from "react";

const { Text } = Typography;

type PaymentProofModalProps = {
  invoice: InvoiceModel;
  onClose: VoidFunction;
};

const invoiceService = new InvoiceService();

export const PaymentProofModal = ({ invoice, onClose }: PaymentProofModalProps) => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { invalidateQuery } = useCacheManager();

  const handleSubmit = async () => {
    if (!file) {
      message.warning("Selecione uma foto do comprovante de pagamento.");
      return;
    }
    try {
      setIsSubmitting(true);
      if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.ANALISYS) {
        message.warning("Fatura já paga ou em análise. Não é possível enviar o comprovante.");
        return;
      }
      const paymentProofUrl = await uploadToCloudinary(file);
      await invoiceService.sendProof(invoice.id, { paymentProofUrl });
      invalidateQuery(invoiceService);
      message.success("Comprovante de pagamento enviado com sucesso!");
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao enviar o comprovante de pagamento.";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`Pagar fatura #${invoice.id}`}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Enviar comprovante"
      cancelText="Cancelar"
      confirmLoading={isSubmitting}
    >
      <Text>Envie uma foto do comprovante de pagamento para concluir o pagamento da fatura.</Text>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(selectedFile) => {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            return false;
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              margin: "0 auto",
              border: "2px dashed #d9d9d9",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: previewUrl ? `url(${previewUrl}) center/cover no-repeat` : undefined,
              overflow: "hidden",
            }}
          >
            {!previewUrl && <Camera size={28} color="#bbb" />}
            {!previewUrl && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                Enviar foto
              </Text>
            )}
          </div>
        </Upload>
      </div>
    </Modal>
  );
};
