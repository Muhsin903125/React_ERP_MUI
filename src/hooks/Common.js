import { useSnackbar, VariantType } from 'notistack';


export function useToast() {
  const { enqueueSnackbar,closeSnackbar } = useSnackbar();
// variant could be success, error, warning, info, or default
 
  function showToast(message, variant) { // showToast(message: string, variant: VariantType)
    console.log("Testing Toast");
    const key = enqueueSnackbar(message, { 
      variant,
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      autoHideDuration: 4000,
      // TransitionComponent: "Fade",
      onClick: () => {
        closeSnackbar(key);
      },
    });
  }

  return { showToast };
}

// export const  GenerateRandomKey=async(length)=> {
//   console.log(length);
// // export function GenerateRandomKey(length:int) {
//   let result = '';
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   const charactersLength = characters.length;
//   for (let i = 0; i < length; i+1) {
//     result += characters.charAt(Math.floor(Math.random() *charactersLength));
//   }
//   return {result};
// }