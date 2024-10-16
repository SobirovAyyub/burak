console.log("Products frontend javascript file");

$(function () {
    $(".product-collection").on("change", () => {
      const selectedValue = $(".product-collection").val();
      if (selectedValue === "DRINK") {
        $("#product-volume").show();
        $("#product-collection").hide();
      } else {
        $("#product-volume").hide();
        $("#product-collection").show();
      }
    });

    $("#process-btn").on("click", () => {
      $(".dish-container").slideToggle(500);
      $("#process-btn").css("display", "none");
    });
    $("#cancel-btn").on("click", () => {
      $(".dish-container").slideToggle(100);
      $("#process-btn").css("display", "flex");
    });
    $(".new-product-status").on("change", async function (e) {
      const id = e.target.id;
      console.log(id);
      const productStatus = $(`#${id}.new-product-status`).val();
      try {
        const response = await axios.post(`/admin/product/${id}`, {
          productStatus: productStatus,
        });
        const result = response.data;
        if (result.data) {
          console.log("Product updated!");
          $(".new-product-status").blur();
        } else {
          alert("Product update failed!");
        }
      } catch (err) {
        console.log(err);
        alert("Product update failed!");
      }
    });
  });





  function validateForm() {
    const productName = $(".product-name").val(),
    productPrice = $(".product-price").val(),
    productLeftCount = $(".product-left-count").val(),
    productDesc = $(".product-desc").val(),
    productStatus = $(".product-status").val(),
    productCollection = $(".product-collection").val();
    if (
      productName === "" ||
      productPrice === "" ||
      productLeftCount === "" ||
      productDesc === "" ||
      productStatus === "" ||
      productCollection === ""
    ) {
      alert("Please insert all required detals!");
      return false;
    } else {
      return true;
    }
  }
  function previewFileHandler(input, order) {
    const imgClassName = input.className;
    console.log("imgClassName:", imgClassName);
    const file = $(`.${imgClassName}`).get(0).files[0];
    const fileType = file["type"];
    const validImageType = ["image/jpg", "image/jpeg", "image/png"];
    if (!validImageType.includes(fileType)) {
      alert("Please insert jpg, jpeg and png!");
    } else {
      if (file) {
        const reader = new FileReader();
        reader.onload = function () {
          $(`#image-section-${order}`).attr("src", reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }