import { useSnackbar, VariantType } from 'notistack';

export function useToast() {
  const { enqueueSnackbar,closeSnackbar } = useSnackbar();
// variant could be success, error, warning, info, or default
 
  function showToast(message: string, variant: VariantType) {
    const key = enqueueSnackbar(message, { 
      variant,
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      autoHideDuration: 5000,
      onClick: () => {
        closeSnackbar(key);
      },
    });
  }

  return { showToast };
}
