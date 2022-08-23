import React, { useState, useEffect, useMemo } from 'react';
import { Rate, Comment, Avatar, Form, Button, Input, Card, Typography } from 'antd';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getProduct } from '../../store/actions//productActions';
import { withRouter } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { addToCart } from '../../store/actions/cartActions';
import { addComment } from '../../store/actions/commentActions';
import {
  getUserRatingForProduct,
  updateUserRatingForProduct,
  addRating,
} from '../../store/actions/ratingActions';
import moment from 'moment';
import { openNotificationWithIcon } from '../../components/Notification/Notification';
import Loader from '../../components/Loader/Loader';
import Cart from '../../components/Cart/Cart';

const { TextArea } = Input;

const Editor = ({ onChange, onSubmit, submitting, value }) => (
  <>
    <Form.Item>
      <TextArea rows={2} style={{ width: 500 }} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Add Comment
      </Button>
    </Form.Item>
  </>
);

const Product = ({
  auth,
  getProduct,
  getUserRatingForProduct,
  updateUserRatingForProduct,
  addRating,
  history,
  match,
  product,
  isLoading,
  isAddingComment,
  addCommentError,
  userRating,
  addToCart,
  addComment,
}) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    getProduct(match.params.id, history);
    getUserRatingForProduct(match.params.id);
  }, []);

  useEffect(() => {
    if (product?.error || addCommentError) {
      openNotificationWithIcon({
        type: 'error',
        message: product.error || addCommentError,
      });
    }
  }, [product, addCommentError]);

  const onAddToCart = () => addToCart(product);

  const goBack = () => {
    history.goBack();
  };

  const onChangeRating = (rate) =>
    userRating
      ? updateUserRatingForProduct(match.params.id, { rate })
      : addRating(match.params.id, { rate });

  const onSubmitComment = async () => {
    addComment(product, { comment });
    setComment('');
  };

  const productInfo = useMemo(
    () =>
      product && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 16 }}>
            <Typography.Title level={3}>
              {product.name}
              <span style={{ fontSize: 12 }}>&nbsp; By</span>{' '}
              <span style={{ fontSize: 14, color: '#C35600' }}>{product.seller.storeName}</span>
            </Typography.Title>
            <Typography.Text style={{ fontSize: 16 }}>{product.description}</Typography.Text>
            <br />
            <br />
            <Typography.Text strong style={{ fontSize: 16 }}>
              Price: <span style={{ color: '#C35600' }}>₹ {product.price.toFixed(2)}</span>
            </Typography.Text>
            <br />
            <Typography.Text strong style={{ fontSize: 14 }}>
              Brand: <span style={{ color: '#C35600' }}>{product.brand}</span>
            </Typography.Text>
            <br />
            <Typography.Text strong style={{ fontSize: 14 }}>
              Category: {product.category}
            </Typography.Text>
            <br />
            <div>
              <Typography.Text style={{ fontSize: 16 }}>
                {(product.avgRating || 0).toFixed(1)}{' '}
              </Typography.Text>
              <Rate disabled allowHalf value={product.avgRating} onChange={onChangeRating} />
              <Typography.Text
                style={{ fontSize: 16 }}
              >{` (${product.numRatings})`}</Typography.Text>
            </div>
            <Button
              type={'link'}
              style={{ width: '150px', paddingLeft: 0 }}
              onClick={() => history.push('/store/' + product.seller.id)}
            >
              More from this seller
            </Button>
          </div>
          {auth.isAuthenticated ? (
            <Button type="primary" style={{ width: '150px' }} onClick={() => onAddToCart()}>
              Add to Cart
            </Button>
          ) : (
            <Button
              type="primary"
              style={{ width: '150px' }}
              onClick={() => history.push('/login')}
            >
              Login to Buy
            </Button>
          )}
        </div>
      ),
    [product],
  );

  const userRatingInfo = useMemo(
    () =>
      auth.isAuthenticated ? (
        <div>
          <Typography.Text strong>Your Ratings &nbsp;</Typography.Text>
          <Rate allowHalf allowClear value={userRating?.rate || 0} onChange={onChangeRating} />{' '}
          <Typography.Text strong>{(userRating?.rate || 0).toFixed(1)}</Typography.Text>
          <br /> <br />
        </div>
      ) : (
        <Typography.Text style={{ color: '#B12705' }}>
          * You need to be logged in to leave comment or rate this product.
        </Typography.Text>
      ),
    [auth, userRating],
  );

  const productThumbnail = useMemo(
    () =>
      product && (
        <div style={{ marginRight: 32 }}>
          <Card
            style={{
              height: '500px',
              width: '500px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                alt="example"
                height="auto"
                width="auto"
                style={{ maxWidth: '450px', maxHeight: '450px' }}
                src={product.image || 'https://www.freeiconspng.com/uploads/no-image-icon-4.png'}
              />
            </div>
          </Card>
        </div>
      ),
    [product],
  );

  const commentsSection = useMemo(
    () =>
      product && product.comments.length > 0 ? (
        product.comments.map((x) => (
          <Comment
            author={<Typography.Text strong>{x.user.name}</Typography.Text>}
            avatar={<Avatar src={x.user.avatar} alt="Han Solo" />}
            datetime={moment(x.createdAt).fromNow()}
            content={<Typography.Text>{x.comment}</Typography.Text>}
          />
        ))
      ) : (
        <Typography.Text>This product has no comments yet!</Typography.Text>
      ),
    [product],
  );

  const productInfoRow = useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '85%',
          marginTop: 32,
          marginBottom: 24,
        }}
      >
        {productThumbnail}
        {productInfo}
      </div>
    ),
    [productThumbnail, productInfo],
  );

  return isLoading ? (
    <Loader />
  ) : (
    <Layout>
      <div
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'flex-start',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Button
          onClick={goBack}
          icon={<ArrowLeftOutlined />}
          style={{ alignSelf: 'flex-start' }}
          type="link"
        >
          Back to Results
        </Button>
        <div>
          {productInfoRow}
          {userRatingInfo}
          <Typography.Title level={3}>Comments</Typography.Title>
          {auth.isAuthenticated && (
            <Comment
              author={<Typography.Text strong>{auth.me?.username}</Typography.Text>}
              avatar={<Avatar src={auth.me?.avatar} alt="Han Solo" />}
              content={
                <Editor
                  submitting={isAddingComment}
                  onChange={(e) => setComment(e.target.value)}
                  onSubmit={onSubmitComment}
                  value={comment}
                />
              }
            />
          )}

          {commentsSection}
        </div>
      </div>
      <Cart />
    </Layout>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  isLoading: state.product.isLoading,
  product: state.product.product,
  isAddingComment: state.product.isAddingComment,
  addCommentError: state.product.addCommentError,
  userRating: state.product.userRating,
});

export default compose(
  withRouter,
  connect(mapStateToProps, {
    getProduct,
    addToCart,
    addComment,
    addRating,
    getUserRatingForProduct,
    updateUserRatingForProduct,
  }),
)(Product);
