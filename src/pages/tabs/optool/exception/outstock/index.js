import React, { useState } from 'react'
import { Button, Input, Form, Modal } from 'antd'
import Breadcrumb from '@components/breadcrumb/Breadcrumb'
import { debounce } from 'lodash'
import utils from '@utils'
import styles from './index.less'

const { TextArea } = Input
const FormItem = Form.Item

// 缺货率处理
const OutOfStock = (props) => {
  // hook
  const [nos, setNos] = useState('')
  const [status, setStatus] = useState('')
  const [help, setHelp] = useState('')

  /**
   * 校验字符串是否合法
   * @param {*} str 
   * flag: 0: 成功，1: 超过长度，2: 空
   * num: 行数
   * result: 处理后的字符串结果
   */
  const checkValid = (str) => {
    let res = {
      flag: 0,
      num: 0,
      result: str
    }
    str  = str ? str.trim() : '' 
    if (str) {
      str = str.replace(/\n/g, ',')
      res.result = str
      const strArr = (str || '').split(',')
      if (strArr.length > 100) {
        res.flag = 1
      }
      res.num = strArr.length
    } else {
      res.flag = 2
    }
    return res
  }

  const handleValid = (val) => {
    const res = checkValid(val)
    // console.log("res", res)
    switch(res.flag) {
      case 0:
        setStatus('')
        setHelp('')
        break
      case 1:
        setStatus('error')
        setHelp(`超出有效长度100行，${res.num}/100`)
        break
      case 2:
          setStatus('error')
          setHelp('输入内容不能为空')
          break
      default:
        break
    }
    return res
  }

  const handleSubmit = (e) => {
    const res = handleValid(nos)
    console.log("res", res)
    if (res.flag === 0) {
      Modal.confirm({
        title: '提醒',
        content: '你确认对以上采购单，不算入缺货率么?',
        okText: '确认',
        cancelText: '取消',
        onOk: () => { handleRequest(res) }
      })
    }
  }

  const handleRequest = (res) => {
    const data = { purchaseOrderUuids: res.result }
    axios.post('/manager/operation_tools/oos_rate/exception_process', JSON.stringify(data))
    .then(resp => {
      utils.showMessageSuccess('操作成功！')
      setNos('')
    })
    .catch(err => {
      utils.showModalError('操作失败', err)
    })
  }

  // 防抖检测数据合法性
  const handleKeyUp = debounce((val) => handleValid(val), 300)

  return (
    <aside className={styles.content}>
      <div className={styles.header}>
        <Breadcrumb />
        <div className={styles.title}>缺货率处理</div>
      </div>
      <div className={styles.body}>
        <div className={styles.input_con}>
          <Form>
            <FormItem validateStatus={status} help={help}>
              <TextArea 
                autoSize={{ minRows: 18, maxRows: 25 }} 
                value={nos} 
                onChange={e => setNos(e.target.value)}
                onKeyUp={e => handleKeyUp(e.target.value)}
                />
            </FormItem>
          </Form>
          <Button className={styles.btn_submit} onClick={(e) => handleSubmit(e)} type="primary">确认不算缺货</Button>
        </div>
        <div className={styles.text_con}>
          <p className={styles.info}>1.每行一个采购单，每次最多100个</p>
          <p className={styles.info}>2.此功能仅针对供应商层级计算时剔除</p>
          <p className={styles.info}>3.请谨慎使用，非供应商原因导致的才能剔除</p>
        </div>
      </div>
    </aside>
  )
}

export default OutOfStock