export const SubscriptionPermissions = {
  Create: {
    name: "subscription_create",
    displayName: "Criar fatura",
    description: "Permite criar novas faturas",
    isAdminPermission: true,
  },
  Read: {
    name: "subscription_read",
    displayName: "Visualizar faturas",
    description: "Permite visualizar faturas existentes",
    isAdminPermission: false,
  },
  Update: {
    name: "subscription_update",
    displayName: "Editar faturas",
    description: "Permite editar faturas existentes",
    isAdminPermission: true,
  },
  SendProof: {
    name: "subscription_send_proof",
    displayName: "Enviar comprovante",
    description: "Permite enviar comprovante de pagamento da fatura",
    isAdminPermission: false,
  },
};
