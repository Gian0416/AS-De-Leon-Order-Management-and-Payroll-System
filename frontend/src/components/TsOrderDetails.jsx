export default function TsOrderDetails({
    order, msg, showPayForm, payAmt,
    laborInput, onLaborChange, onLaborSave,
    installDate, onInstallDateChange, onInstallDateSave,
    onPayAmtChange, onShowPayForm,
    onApprove, onNextStatus, onRecordPayment
}) 
{}
            {msg.text && <p className={`ts-msg ${msg.ok ? 'ok' : 'error'}`}>{msg.text}</p>}
