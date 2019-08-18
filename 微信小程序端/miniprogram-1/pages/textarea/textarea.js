// pages/textarea/textarea.js
Page({
  data: {
    txtRealContent: '',
    txtContent: '',
    showMask: false,
    txtHeight: 0
  },
  textAreaLineChange(e) {
    this.setData({ txtHeight: e.detail.height })
  },
  txtInput(e) {
    this.setData({ txtContent: e.detail.value })
  },
  changeMaskVisible(e) {
    if (!this.data.showMask) {
      // 将换行符转换为wxml可识别的换行元素 <br/>
      const txtRealContent = this.data.txtContent.replace(/\n/g, '<br/>')
      this.setData({ txtRealContent })
    }
    this.setData({ showMask: !this.data.showMask })
  }
})